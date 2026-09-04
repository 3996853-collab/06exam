import io
import zipfile
from datetime import date, datetime
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models import ReceiptOcrRecord, RecognitionStatus
from app.schemas import VlmExtractionResult
from app.services.image_processor import ImageProcessor
from app.services.storage import LocalStorage, MockOSSStorage
from app.services.vlm_client import VlmClient
from app.services.pod_processor import PodProcessor


def create_test_image_bytes(width=800, height=600, color="white") -> bytes:
    """生成测试用的回单图片二进制数据"""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_image_processor():
    """测试图片预处理、压缩与哈希"""
    raw_bytes = create_test_image_bytes(width=2500, height=1800)
    processed_bytes, mime, b64, fhash = ImageProcessor.process_and_optimize(raw_bytes, "test.jpg")

    assert mime == "image/jpeg"
    assert len(b64) > 0
    assert len(fhash) == 64
    # 验证大图已被等比缩放到 2048 以内
    with Image.open(io.BytesIO(processed_bytes)) as img:
        assert max(img.size) <= ImageProcessor.MAX_DIMENSION
    print("[PASS] test_image_processor")


def test_vlm_parsing_clean():
    """测试 VLM 响应的清洗与严格防幻觉校验"""
    client = VlmClient()

    # 测试标准输出
    raw_json = '''```json
    {
      "delivery_no": "ZTO20260904001 ",
      "sign_date": "2026-09-04",
      "sign_time": "2026-09-04 09:30:00",
      "confidence": 0.98,
      "error_message": null
    }
    ```'''
    res = client._parse_json_response(raw_json)
    assert res.delivery_no == "ZTO20260904001"
    assert res.sign_date == date(2026, 9, 4)
    assert res.confidence == 0.98

    # 测试带有特殊字符或非法的送货单号清洗
    dirty_json = '''
    {
      "delivery_no": "NO. #ZTO-8899@! ",
      "sign_date": "2026-09-04",
      "sign_time": null,
      "confidence": 0.95,
      "error_message": null
    }
    '''
    res2 = client._parse_json_response(dirty_json)
    assert res2.delivery_no == "ZTO-8899"
    assert res2.sign_date == date(2026, 9, 4)
    assert res2.sign_time is None

    # 测试缺失字段
    missing_json = '''
    {
      "delivery_no": null,
      "sign_date": null,
      "sign_time": null,
      "confidence": 0.20,
      "error_message": "条码破损且无水印"
    }
    '''
    res3 = client._parse_json_response(missing_json)
    assert res3.delivery_no is None
    assert res3.sign_date is None
    print("[PASS] test_vlm_parsing_clean")


def test_pod_processor_flow_and_status_logic():
    """测试核心业务处理链路：状态机流转与数据库落库"""
    # 创建内存 SQLite 用于完全隔离测试
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestSessionLocal()
    mock_storage = MockOSSStorage(bucket_name="test-pod-bucket")
    vlm_client = VlmClient()

    processor = PodProcessor(db=db, storage=mock_storage, vlm_client=vlm_client)

    # 1. 测试成功场景
    img_data = create_test_image_bytes(400, 300)
    batch_id = "BATCH_TEST_001"
    single_res = processor.process_single_image(img_data, "test_success.jpg", batch_id, "tester")

    assert single_res.record_id is not None
    assert "test-pod-bucket" in single_res.image_url

    # 验证落表
    record = db.query(ReceiptOcrRecord).filter(ReceiptOcrRecord.id == single_res.record_id).first()
    assert record is not None
    assert record.batch_id == batch_id
    if record.delivery_no and record.sign_date:
        assert record.recognition_status == RecognitionStatus.SUCCESS.value
    else:
        assert record.recognition_status == RecognitionStatus.PENDING_REVIEW.value

    # 2. 测试 ZIP 批量解压与处理
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zf:
        zf.writestr("receipt1.png", create_test_image_bytes(200, 200))
        zf.writestr("receipt2.jpg", create_test_image_bytes(300, 300))
        zf.writestr("readme.txt", b"ignore this file")  # 非图片应被自动过滤

    extracted = PodProcessor.extract_images_from_zip(zip_buffer.getvalue())
    assert len(extracted) == 2
    assert set(name for name, _ in extracted) == {"receipt1.png", "receipt2.jpg"}

    # 3. 测试批量并发处理
    batch_summary = processor.process_batch_images(extracted, batch_id="BATCH_ZIP_002")
    assert batch_summary.total_count == 2
    assert len(batch_summary.records) == 2

    print("[PASS] test_pod_processor_flow_and_status_logic")


if __name__ == "__main__":
    print("--- Start POD OCR Core Automated Testing ---")
    test_image_processor()
    test_vlm_parsing_clean()
    test_pod_processor_flow_and_status_logic()
    print("All tests passed successfully!")

