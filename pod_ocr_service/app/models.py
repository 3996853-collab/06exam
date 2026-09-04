from datetime import datetime
from enum import IntEnum
from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    String,
    Date,
    DateTime,
    SmallInteger,
    Index
)
from app.database import Base


class RecognitionStatus(IntEnum):
    """
    识别状态枚举:
    1 - 识别成功 (delivery_no 与 sign_date 均成功提取)
    2 - 人工补录 (客服/作业员人工介入修正并确认)
    3 - 待处理 (任一字段缺失或模型解析失败，需人工复核)
    """
    SUCCESS = 1
    MANUAL_RECORDED = 2
    PENDING_REVIEW = 3


class ReceiptOcrRecord(Base):
    """
    送货单回单 OCR 识别记录表
    映射表: t_receipt_ocr_record
    """
    __tablename__ = "t_receipt_ocr_record"

    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
        comment="自增主键"
    )
    delivery_no = Column(String(64), nullable=False, default="", comment="送货单号")
    sign_date = Column(Date, nullable=True, comment="签收日期(数仓分区与统计核心字段)")
    sign_time = Column(DateTime, nullable=True, comment="水印完整签收时间")
    image_url = Column(String(512), nullable=False, default="", comment="对象存储访问地址")
    image_oss_key = Column(String(255), nullable=False, default="", comment="对象存储Key")
    raw_file_name = Column(String(255), nullable=False, default="", comment="上传原始文件名")
    batch_id = Column(String(64), nullable=False, default="", comment="批次号")
    recognition_status = Column(SmallInteger, nullable=False, default=RecognitionStatus.SUCCESS.value, comment="状态: 1-识别成功 2-人工补录 3-待处理")
    created_by = Column(String(64), nullable=False, default="system", comment="创建者")
    created_at = Column(DateTime, nullable=False, default=datetime.now, comment="创建时间")
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now, comment="更新时间")

    __table_args__ = (
        Index("idx_delivery_no", "delivery_no"),
        Index("idx_sign_date", "sign_date"),
        Index("idx_updated_at", "updated_at"),
        Index("idx_batch_id", "batch_id"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"}
    )

    def __repr__(self) -> str:
        return (
            f"<ReceiptOcrRecord(id={self.id}, delivery_no='{self.delivery_no}', "
            f"sign_date={self.sign_date}, status={self.recognition_status})>"
        )
