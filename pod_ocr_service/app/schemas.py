from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models import RecognitionStatus


# ==========================================
# VLM 结构化提取输出规范 (JSON Mode Schema)
# ==========================================
class VlmExtractionResult(BaseModel):
    """大模型直接解析的严格输出结构"""
    delivery_no: Optional[str] = Field(
        default=None,
        description="送货单号，仅包含字母数字，剔除汉字空格标点。模糊缺失输出 null"
    )
    sign_date: Optional[date] = Field(
        default=None,
        description="水印签收日期，严格 ISO 8601 格式 YYYY-MM-DD，缺失输出 null"
    )
    sign_time: Optional[datetime] = Field(
        default=None,
        description="水印完整时间戳，格式 YYYY-MM-DD HH:mm:ss，若无具体时间输出 null"
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="综合置信度得分 0.00 ~ 1.00"
    )
    error_message: Optional[str] = Field(
        default=None,
        description="无法识别或模糊时的异常描述"
    )

    model_config = ConfigDict(extra="ignore")


# ==========================================
# API 请求与响应 Schema
# ==========================================
class ReceiptRecordOut(BaseModel):
    """数据库记录输出详情"""
    id: int
    delivery_no: str
    sign_date: Optional[date] = None
    sign_time: Optional[datetime] = None
    image_url: str
    image_oss_key: str
    raw_file_name: str
    batch_id: str
    recognition_status: RecognitionStatus
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SingleProcessResult(BaseModel):
    """单个图片处理结果包装"""
    raw_file_name: str
    image_url: str
    image_oss_key: str
    delivery_no: Optional[str]
    sign_date: Optional[date]
    sign_time: Optional[datetime]
    confidence: float
    recognition_status: RecognitionStatus
    error_message: Optional[str] = None
    record_id: Optional[int] = None


class BatchProcessSummary(BaseModel):
    """批量识别任务汇总响应"""
    batch_id: str
    total_count: int
    success_count: int
    pending_count: int
    records: List[SingleProcessResult]


class ManualRecordUpdateRequest(BaseModel):
    """人工补录更新请求"""
    delivery_no: Optional[str] = Field(default=None, min_length=1, max_length=64, description="修正后的送货单号")
    sign_date: Optional[date] = Field(default=None, description="修正后的签收日期 YYYY-MM-DD")
    sign_time: Optional[datetime] = Field(default=None, description="修正后的完整签收时间")
    operator: str = Field(default="admin", description="补录操作人工号/姓名")
