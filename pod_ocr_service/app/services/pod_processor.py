import os
import io
import uuid
import zipfile
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import List, Tuple
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import ReceiptOcrRecord, RecognitionStatus
from app.schemas import SingleProcessResult, BatchProcessSummary
from app.services.image_processor import ImageProcessor
from app.services.storage import get_storage_client, BaseStorage
from app.services.vlm_client import VlmClient

logger = logging.getLogger(__name__)
settings = get_settings()

SUPPORTED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


class PodProcessor:
    """
    送货单回单核心业务编排器:
    - 图像格式清洗与 ZIP 自动解压缩
    - ThreadPool 并发调用多模态 VLM
    - 存证上传与 URL 获取
    - 状态机判断（1-成功，3-待处理）
    - 事务写入 MySQL 表 t_receipt_ocr_record
    """

    def __init__(self, db: Session, storage: BaseStorage = None, vlm_client: VlmClient = None):
        self.db = db
        self.storage = storage or get_storage_client()
        self.vlm_client = vlm_client or VlmClient()

    def process_single_image(
        self,
        image_bytes: bytes,
        filename: str,
        batch_id: str,
        operator: str = "system"
    ) -> SingleProcessResult:
        """处理单张回单照片全流程"""
        # 1. 图像预处理、压缩与方向矫正
        processed_bytes, mime_type, base64_str, file_hash = ImageProcessor.process_and_optimize(
            image_bytes, filename
        )

        # 2. 生成规范的对象存储 Key，并持久化到存储桶/本地
        ext = os.path.splitext(filename)[1].lower() or ".jpg"
        date_prefix = datetime.now().strftime("%Y/%m/%d")
        file_key = f"pod_receipts/{date_prefix}/{file_hash[:16]}_{uuid.uuid4().hex[:8]}{ext}"

        image_url, oss_key = self.storage.upload(processed_bytes, file_key, content_type=mime_type)

        # 3. 调用多模态 VLM 结构化提取
        ocr_result = self.vlm_client.extract_from_base64(base64_str, mime_type=mime_type)

        # 4. 业务状态机判定
        # 规则：delivery_no 和 sign_date 均成功提取为 1(识别成功)；任一缺失为 3(待处理)
        has_delivery_no = bool(ocr_result.delivery_no and ocr_result.delivery_no.strip())
        has_sign_date = bool(ocr_result.sign_date)

        if has_delivery_no and has_sign_date:
            status = RecognitionStatus.SUCCESS
        else:
            status = RecognitionStatus.PENDING_REVIEW

        # 5. 落库持久化
        record = ReceiptOcrRecord(
            delivery_no=ocr_result.delivery_no or "",
            sign_date=ocr_result.sign_date,
            sign_time=ocr_result.sign_time,
            image_url=image_url,
            image_oss_key=oss_key,
            raw_file_name=filename,
            batch_id=batch_id,
            recognition_status=status.value,
            created_by=operator
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        return SingleProcessResult(
            raw_file_name=filename,
            image_url=image_url,
            image_oss_key=oss_key,
            delivery_no=ocr_result.delivery_no,
            sign_date=ocr_result.sign_date,
            sign_time=ocr_result.sign_time,
            confidence=ocr_result.confidence,
            recognition_status=status,
            error_message=ocr_result.error_message,
            record_id=record.id
        )

    def process_batch_images(
        self,
        files_data: List[Tuple[str, bytes]],
        batch_id: str = None,
        operator: str = "system"
    ) -> BatchProcessSummary:
        """
        批量图片并发处理
        files_data: [(filename, image_bytes), ...]
        """
        batch_id = batch_id or f"BATCH_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
        results: List[SingleProcessResult] = []

        max_workers = min(settings.MAX_CONCURRENT_WORKERS, max(1, len(files_data)))

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # 提交任务
            future_to_file = {
                executor.submit(self._worker_process, filename, data, batch_id, operator): filename
                for filename, data in files_data
            }

            for future in as_completed(future_to_file):
                filename = future_to_file[future]
                try:
                    res = future.result()
                    results.append(res)
                except Exception as exc:
                    logger.exception(f"处理文件 {filename} 失败: {exc}")
                    results.append(
                        SingleProcessResult(
                            raw_file_name=filename,
                            image_url="",
                            image_oss_key="",
                            delivery_no=None,
                            sign_date=None,
                            sign_time=None,
                            confidence=0.0,
                            recognition_status=RecognitionStatus.PENDING_REVIEW,
                            error_message=f"处理异常: {str(exc)}"
                        )
                    )

        success_count = sum(1 for r in results if r.recognition_status == RecognitionStatus.SUCCESS)
        pending_count = len(results) - success_count

        return BatchProcessSummary(
            batch_id=batch_id,
            total_count=len(results),
            success_count=success_count,
            pending_count=pending_count,
            records=results
        )

    def _worker_process(
        self, filename: str, image_bytes: bytes, batch_id: str, operator: str
    ) -> SingleProcessResult:
        """多线程工作函数（每个线程拥有独立的 DB Session）"""
        # 优先复用当前 session 的 bind engine（兼容测试 SQLite 及生产 MySQL）
        bind_engine = self.db.bind
        if bind_engine is not None:
            from sqlalchemy.orm import sessionmaker
            ThreadSession = sessionmaker(autocommit=False, autoflush=False, bind=bind_engine)
            thread_db = ThreadSession()
        else:
            from app.database import SessionLocal
            thread_db = SessionLocal()

        try:
            worker_processor = PodProcessor(thread_db, self.storage, self.vlm_client)
            return worker_processor.process_single_image(image_bytes, filename, batch_id, operator)
        finally:
            thread_db.close()

    @classmethod
    def extract_images_from_zip(cls, zip_bytes: bytes) -> List[Tuple[str, bytes]]:
        """从上传的 ZIP 文件中提取所有有效图片"""
        extracted_files = []
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            for zip_info in zf.infolist():
                if zip_info.is_dir():
                    continue
                filename = os.path.basename(zip_info.filename)
                # 过滤 macOS 压缩包生成的 __MACOSX 垃圾文件及隐藏文件
                if filename.startswith(".") or "__MACOSX" in zip_info.filename:
                    continue
                ext = os.path.splitext(filename)[1].lower()
                if ext in SUPPORTED_IMAGE_EXTS:
                    file_data = zf.read(zip_info.filename)
                    extracted_files.append((filename, file_data))
        return extracted_files
