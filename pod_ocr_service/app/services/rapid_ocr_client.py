import io
import re
import logging
from datetime import datetime, date
from typing import Optional, Tuple, List
import numpy as np
from PIL import Image
import cv2

from app.schemas import VlmExtractionResult

logger = logging.getLogger(__name__)

# 全局单例 RapidOCR 引擎，避免每次请求重复初始化加载模型
_rapid_ocr_engine = None


def get_rapid_ocr_engine():
    global _rapid_ocr_engine
    if _rapid_ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _rapid_ocr_engine = RapidOCR()
            logger.info("RapidOCR (rapidocr_onnxruntime) engine initialized successfully.")
        except Exception as e:
            logger.error("Failed to initialize RapidOCR: %s", e)
            raise e
    return _rapid_ocr_engine


class RapidOcrClient:
    """
    基于 RapidOCR (PP-OCRv4 ONNX) + 二维码解码的纯本地送货单识别引擎:
    1. 单号提取:
       - 优先扫描定位图片【右下角】区域的【二维码(QR Code)】解析单号
       - 若右下角二维码未扫出，则遍历全图二维码
       - 若无二维码，利用 RapidOCR 识别结果匹配“出库单号”、“送货单号”、“单号”、“凭证编号”或纯条码文本
    2. 水印日期与打卡时间提取:
       - 利用 RapidOCR 检测边缘/水印文字中的打卡时间戳（如 2026-09-04 09:30:15、2026.09.04、2026年09月04日）
       - 转换为标准 ISO-8601 YYYY-MM-DD 与 YYYY-MM-DD HH:mm:ss
    """

    def __init__(self):
        self.engine = get_rapid_ocr_engine()
        self.qr_detector = cv2.QRCodeDetector()

    def extract_from_bytes(self, image_bytes: bytes) -> VlmExtractionResult:
        """主入口：从图片二进制直接执行识别"""
        try:
            # 1. 转化为 OpenCV BGR 图像
            np_arr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img_bgr is None:
                return VlmExtractionResult(
                    delivery_no=None,
                    sign_date=None,
                    sign_time=None,
                    confidence=0.0,
                    error_message="图片解码失败，文件可能损坏"
                )

            h, w = img_bgr.shape[:2]

            # 2. 识别二维码 (重点关注右下角)
            delivery_no, qr_conf = self._detect_qr_code(img_bgr, h, w)

            # 3. 运行 RapidOCR 文本检测与识别
            ocr_result, _ = self.engine(img_bgr)
            # ocr_result 格式: [[box, text, score], ...]

            ocr_texts = []
            ocr_scores = []
            if ocr_result:
                for item in ocr_result:
                    box, text, score = item[0], item[1], float(item[2])
                    ocr_texts.append((box, text, score))
                    ocr_scores.append(score)

            # 4. 如果二维码未提取到单号，尝试从 OCR 文本中提取出库单号/单号
            if not delivery_no:
                delivery_no, text_no_conf = self._extract_order_no_from_ocr(ocr_texts)
            else:
                text_no_conf = qr_conf

            # 5. 从 OCR 文本中定位并提取相机水印打卡日期和时间
            sign_date, sign_time, time_conf = self._extract_watermark_datetime(ocr_texts, h, w)

            # 6. 计算置信度
            base_conf = []
            if delivery_no:
                base_conf.append(text_no_conf)
            if sign_date:
                base_conf.append(time_conf)
            if ocr_scores:
                base_conf.append(sum(ocr_scores) / len(ocr_scores))

            final_conf = round(sum(base_conf) / len(base_conf), 2) if base_conf else 0.0

            error_msg = None
            if not delivery_no and not sign_date:
                error_msg = "未检测到有效的右下二维码/出库单号及相机水印时间"
            elif not delivery_no:
                error_msg = "未检测到有效的右下二维码或出库单号"
            elif not sign_date:
                error_msg = "未检测到有效的相机水印签收日期"

            return VlmExtractionResult(
                delivery_no=delivery_no,
                sign_date=sign_date,
                sign_time=sign_time,
                confidence=final_conf,
                error_message=error_msg
            )

        except Exception as e:
            logger.exception("RapidOCR 识别处理异常: %s", e)
            return VlmExtractionResult(
                delivery_no=None,
                sign_date=None,
                sign_time=None,
                confidence=0.0,
                error_message=f"RapidOCR 处理异常: {str(e)}"
            )

    def extract_from_base64(self, image_base64: str, mime_type: str = "image/jpeg") -> VlmExtractionResult:
        """兼容原有基于 base64 调用的统一接口"""
        import base64
        image_bytes = base64.b64decode(image_base64)
        return self.extract_from_bytes(image_bytes)

    def _detect_qr_code(self, img_bgr: np.ndarray, h: int, w: int) -> Tuple[Optional[str], float]:
        """优先从右下角检测二维码，其次全图检测"""
        # 截取右下角区域 (右半部分 + 下半部分: x > w*0.4, y > h*0.4)
        br_roi = img_bgr[int(h * 0.4):, int(w * 0.4):]

        # 尝试使用 pyzbar (若支持) 或 cv2.QRCodeDetector
        qr_text = self._decode_qr(br_roi)
        if qr_text:
            cleaned = self._clean_order_no(qr_text)
            if cleaned:
                return cleaned, 0.98

        # 若右下角没扫出，扫全图
        full_qr = self._decode_qr(img_bgr)
        if full_qr:
            cleaned = self._clean_order_no(full_qr)
            if cleaned:
                return cleaned, 0.95

        return None, 0.0

    def _decode_qr(self, img: np.ndarray) -> Optional[str]:
        """综合使用 pyzbar 与 cv2 解码二维码"""
        # 1. 尝试 pyzbar
        try:
            from pyzbar import pyzbar
            barcodes = pyzbar.decode(img)
            for barcode in barcodes:
                data = barcode.data.decode("utf-8", errors="ignore").strip()
                if data:
                    return data
        except Exception:
            pass

        # 2. 尝试 cv2.QRCodeDetector
        try:
            data, bbox, _ = self.qr_detector.detectAndDecode(img)
            if data and data.strip():
                return data.strip()
        except Exception:
            pass

        return None

    def _extract_order_no_from_ocr(self, ocr_texts: List) -> Tuple[Optional[str], float]:
        """从 RapidOCR 检测文字列表中抽取出库单号/送货单号"""
        # 规则 1：优先匹配标注有“出库单号”、“出库单”、“送货单号”、“单号”、“NO.”的行
        for _, text, score in ocr_texts:
            t = text.strip()
            if any(k in t for k in ["出库单号", "出库单", "送货单号", "凭证号", "单号", "NO", "No"]):
                # 剔除汉字与标签
                cleaned = self._clean_order_no(t)
                if cleaned and len(cleaned) >= 5:
                    return cleaned, round(score, 2)

        # 规则 2：寻找符合物流单号特征的连续英数串 (如 CK2026..., ZTO..., 10位以上连续纯数字/字母)
        order_pattern = re.compile(r"\b([A-Za-z]{1,4}[0-9]{6,20}|[0-9]{8,20})\b")
        candidates = []
        for box, text, score in ocr_texts:
            matches = order_pattern.findall(text)
            for m in matches:
                # 排除像日期的串如 20260904123000
                if len(m) >= 6:
                    candidates.append((m, score))

        if candidates:
            # 优先返回置信度最高或带字母前缀的单号
            candidates.sort(key=lambda x: (not x[0].isdigit(), x[1]), reverse=True)
            return candidates[0][0], round(candidates[0][1], 2)

        return None, 0.0

    def _extract_watermark_datetime(
        self, ocr_texts: List, h: int, w: int
    ) -> Tuple[Optional[date], Optional[datetime], float]:
        """从文字中检测相机水印日期与打卡时间"""
        # 常见打卡水印时间格式：
        # 2026-09-04 09:30:15 / 2026.09.04 09:30 / 2026年09月04日 09:30:00 / 2026-09-0815:30:20
        dt_full_pattern = re.compile(
            r"(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})[日\s]*(\d{1,2})[:：](\d{1,2})(?:[:：](\d{1,2}))?"
        )
        date_only_pattern = re.compile(
            r"(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})[日]?"
        )

        found_results = []

        for box, text, score in ocr_texts:
            # 水印通常位于四角或边缘 (y > h*0.6 或 y < h*0.3 或包含“时间/打卡/水印”)
            is_likely_watermark = any(kw in text for kw in ["时间", "打卡", "相机", "地点", "水印"])
            center_y = (box[0][1] + box[2][1]) / 2 if box else 0
            if center_y > h * 0.6 or center_y < h * 0.25:
                is_likely_watermark = True

            # 匹配完整日期+时间
            m_full = dt_full_pattern.search(text)
            if m_full:
                year, month, day, hour, minute = m_full.groups()[:5]
                sec = m_full.group(6) or "00"
                try:
                    dt = datetime(int(year), int(month), int(day), int(hour), int(minute), int(sec))
                    weight = 1.2 if is_likely_watermark else 1.0
                    found_results.append((dt.date(), dt, score * weight))
                    continue
                except Exception:
                    pass

            # 匹配仅日期
            m_date = date_only_pattern.search(text)
            if m_date:
                year, month, day = m_date.groups()
                try:
                    d = date(int(year), int(month), int(day))
                    # 避免把单号中的 20260904 误认为日期
                    if 2020 <= d.year <= 2035:
                        weight = 1.1 if is_likely_watermark else 0.9
                        found_results.append((d, None, score * weight))
                except Exception:
                    pass

        if found_results:
            # 优先选择有具体时间的，并且置信度权值最高的
            found_results.sort(key=lambda x: (x[1] is not None, x[2]), reverse=True)
            best_date, best_dt, best_score = found_results[0]
            return best_date, best_dt, round(min(1.0, best_score), 2)

        return None, None, 0.0

    @staticmethod
    def _clean_order_no(text: str) -> Optional[str]:
        """清洗单号前缀与非英数字符"""
        if not text:
            return None
        t = text.strip()
        t = re.sub(r"^(?:出库单号|出库单|NO|No|单号|送货单号|凭证号|凭证编号)[\.\s:：#]*", "", t, flags=re.IGNORECASE)
        cleaned = re.sub(r"[^a-zA-Z0-9_-]", "", t)
        return cleaned if cleaned else None
