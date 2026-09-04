import json
import logging
import re
from typing import Optional
import httpx
from app.config import get_settings
from app.schemas import VlmExtractionResult

logger = logging.getLogger(__name__)
settings = get_settings()

VLM_SYSTEM_PROMPT = """你是一个专业的中国物流“送货单/出库单回单（POD）”视觉结构化数据抽取引擎。
你的任务是从客服或现场人员通过水印相机拍摄的物理回单照片中，高精准度提取关键凭据信息。

【提取原则与业务规则】
1. 单号 (delivery_no):
   - 【核心规则】：优先提取图片上的“出库单号”；
   - 若未找到“出库单号”，则寻找“送货单号”、“单号”、“凭证编号”、“凭证号”、“No.”或打印的条形码/二维码附带的单号内容；
   - 提取时仅保留连续英数字符（如 CK202609040001、ZTO8899123 等），彻底剔除中文文字（如“出库单号：”）、空格及特殊标点符号；
   - 若字迹严重模糊无法辨认或确实缺失，返回 null，严禁猜测或编造。

2. 签收日期 (sign_date) 与签收时间 (sign_time):
   - 【核心规则】：识别图片水印（如今日水印相机、马克水印相机、钉钉/企业微信打卡水印等）上的【日期】和【打卡时间/拍照时间】作为签收日期和签收时间；
   - 定位图片边缘、四角（通常位于底部、左下角或右下角）生成的半透明或叠加数字水印，或相机水印模板中的“时间”、“打卡时间”、“签收时间”项；
   - sign_date 必须严格转化为 ISO 8601 标准日期格式：YYYY-MM-DD；
   - sign_time 提取水印上的打卡/拍摄具体时间，格式化为：YYYY-MM-DD HH:mm:ss；若水印仅包含日期无具体时分秒，sign_time 设为 null；
   - 【极其重要】：严禁提取表格内原本印刷的制单日期，必须提取相机水印上的日期和打卡时间。

3. 置信度 (confidence):
   - 返回 0.00 至 1.00 之间的浮点数，代表本次综合识别的置信度。

4. 防幻觉与输出规范：
   - 必须且仅输出标准的 JSON 格式对象，严禁包含任何 Markdown 标记、代码块反引号（如 ```json）或额外的客套话。
   - JSON 结构定义：
   {
     "delivery_no": "STRING or null",
     "sign_date": "YYYY-MM-DD or null",
     "sign_time": "YYYY-MM-DD HH:mm:ss or null",
     "confidence": 0.98,
     "error_message": null
   }
"""


class VlmClient:
    """视觉多模态大模型 API 客户端 (兼容 OpenAI 规范，支持 DashScope qwen-vl-max)"""

    def __init__(self):
        self.api_key = settings.VLM_API_KEY
        self.base_url = settings.VLM_BASE_URL.rstrip("/")
        self.model_name = settings.VLM_MODEL_NAME
        self.timeout = settings.VLM_TIMEOUT_SECONDS
        self.max_retries = settings.VLM_MAX_RETRIES

    def extract_from_base64(self, image_base64: str, mime_type: str = "image/jpeg") -> VlmExtractionResult:
        """
        调用 VLM API 处理单张 Base64 编码图片
        """
        # 若是占位或测试 key，走仿真响应逻辑（便于离线演示与测试）
        if not self.api_key or self.api_key in ("your-vlm-api-key-here", "mock-api-key"):
            return self._mock_extraction_response()

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        image_data_uri = f"data:{mime_type};base64,{image_base64}"

        payload = {
            "model": self.model_name,
            "messages": [
                {
                    "role": "system",
                    "content": VLM_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "请仔细辨别这张回单图片，重点提取图片上的【出库单号】作为单号，并识别水印上的【日期】与【打卡时间/拍摄时间】作为签收日期时间，直接输出目标 JSON。"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_data_uri
                            }
                        }
                    ]
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.01,
            "max_tokens": 512
        }

        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, headers=headers, json=payload)
                    response.raise_for_status()
                    data = response.json()
                    raw_content = data["choices"][0]["message"]["content"]
                    return self._parse_json_response(raw_content)
            except Exception as exc:
                last_error = exc
                logger.warning(f"VLM API 调用重试 ({attempt + 1}/{self.max_retries + 1}) 失败: {exc}")

        logger.error(f"VLM API 调用最终失败: {last_error}")
        return VlmExtractionResult(
            delivery_no=None,
            sign_date=None,
            sign_time=None,
            confidence=0.0,
            error_message=f"VLM 调用失败: {str(last_error)}"
        )

    def _parse_json_response(self, content_str: str) -> VlmExtractionResult:
        """安全清洗与反序列化 VLM 响应"""
        clean_text = content_str.strip()
        # 移除可能的多余 Markdown 块包裹
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        try:
            parsed = json.loads(clean_text)
            # 强化清洗单号中的非常规字符
            delivery_no = parsed.get("delivery_no")
            if delivery_no:
                # 剔除常见的标签前缀如 出库单号:, 出库单:, NO., No., 单号:, 凭证号: 等
                no_str = str(delivery_no)
                no_str = re.sub(r"^(?:出库单号|出库单|NO|No|单号|送货单号|凭证号|凭证编号)[\.\s:：#]*", "", no_str, flags=re.IGNORECASE)
                # 规范规则：提取连续字母数字串，剔除汉字、空格及标点符号
                cleaned_no = re.sub(r"[^a-zA-Z0-9_-]", "", no_str)
                parsed["delivery_no"] = cleaned_no if cleaned_no else None

            return VlmExtractionResult.model_validate(parsed)
        except Exception as e:
            logger.error(f"解析 VLM 返回内容失败: {e}, 原始内容: {content_str}")
            return VlmExtractionResult(
                delivery_no=None,
                sign_date=None,
                sign_time=None,
                confidence=0.0,
                error_message=f"JSON 反序列化失败: {str(e)}"
            )

    def _mock_extraction_response(self) -> VlmExtractionResult:
        """用于离线测试或无 API Key 场景下的仿真解析"""
        import random
        from datetime import datetime, timedelta

        # 85% 成功率模拟
        if random.random() < 0.15:
            return VlmExtractionResult(
                delivery_no=None,
                sign_date=None,
                sign_time=None,
                confidence=0.35,
                error_message="未检测到有效清晰的送货单号条码或水印时间戳"
            )

        now = datetime.now() - timedelta(hours=random.randint(1, 48))
        random_no = f"ZTO{now.strftime('%Y%m%d')}{random.randint(10000, 99999)}"
        return VlmExtractionResult(
            delivery_no=random_no,
            sign_date=now.date(),
            sign_time=now.replace(microsecond=0),
            confidence=round(0.92 + random.random() * 0.07, 2),
            error_message=None
        )
