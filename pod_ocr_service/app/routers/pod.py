from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import ReceiptOcrRecord, RecognitionStatus
from app.schemas import (
    SingleProcessResult,
    BatchProcessSummary,
    ReceiptRecordOut,
    ManualRecordUpdateRequest
)
from app.services.pod_processor import PodProcessor

router = APIRouter(prefix="/api/v1/pod", tags=["送货单回单 OCR"])


@router.post(
    "/upload/single",
    response_model=SingleProcessResult,
    summary="单张送货单照片上传与识别"
)
async def upload_single_receipt(
    file: UploadFile = File(..., description="送货单回单照片(jpg/png/jpeg)"),
    batch_id: Optional[str] = Query(None, description="所属批次号(可选)"),
    operator: str = Query("system", description="操作人"),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="上传文件为空")

    processor = PodProcessor(db)
    batch_no = batch_id or f"SINGLE_{file.filename}"
    result = processor.process_single_image(contents, file.filename, batch_no, operator)
    return result


@router.post(
    "/upload/batch",
    response_model=BatchProcessSummary,
    summary="多张送货单照片批量上传与并发识别"
)
async def upload_batch_receipts(
    files: List[UploadFile] = File(..., description="多张送货单回单照片"),
    batch_id: Optional[str] = Query(None, description="自定义批次号(为空则系统生成)"),
    operator: str = Query("system", description="操作人"),
    db: Session = Depends(get_db)
):
    if not files:
        raise HTTPException(status_code=400, detail="未上传任何图片文件")

    files_data = []
    for f in files:
        data = await f.read()
        if data:
            files_data.append((f.filename, data))

    if not files_data:
        raise HTTPException(status_code=400, detail="所有上传的文件内容均为空")

    processor = PodProcessor(db)
    summary = processor.process_batch_images(files_data, batch_id=batch_id, operator=operator)
    return summary


@router.post(
    "/upload/zip",
    response_model=BatchProcessSummary,
    summary="ZIP 压缩包上传、解压与并发批量识别"
)
async def upload_zip_receipts(
    file: UploadFile = File(..., description="包含送货单照片的 ZIP 压缩文件"),
    batch_id: Optional[str] = Query(None, description="自定义批次号"),
    operator: str = Query("system", description="操作人"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="仅支持上传 .zip 格式的压缩文件")

    zip_bytes = await file.read()
    if not zip_bytes:
        raise HTTPException(status_code=400, detail="ZIP 文件内容为空")

    try:
        files_data = PodProcessor.extract_images_from_zip(zip_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"解压 ZIP 失败: {str(e)}")

    if not files_data:
        raise HTTPException(status_code=400, detail="ZIP 文件中未找到符合格式的送货单图片(jpg/png/webp)")

    processor = PodProcessor(db)
    summary = processor.process_batch_images(files_data, batch_id=batch_id, operator=operator)
    return summary


@router.get(
    "/records",
    response_model=List[ReceiptRecordOut],
    summary="查询识别记录列表 (支持数仓抽取与分页过滤)"
)
def list_records(
    batch_id: Optional[str] = Query(None, description="批次号筛选"),
    delivery_no: Optional[str] = Query(None, description="送货单号精准查询"),
    status: Optional[RecognitionStatus] = Query(None, description="状态筛选"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=200, description="每页条数"),
    db: Session = Depends(get_db)
):
    query = db.query(ReceiptOcrRecord)
    if batch_id:
        query = query.filter(ReceiptOcrRecord.batch_id == batch_id)
    if delivery_no:
        query = query.filter(ReceiptOcrRecord.delivery_no == delivery_no)
    if status:
        query = query.filter(ReceiptOcrRecord.recognition_status == status.value)

    records = query.order_by(desc(ReceiptOcrRecord.id)).offset((page - 1) * page_size).limit(page_size).all()
    return records


@router.put(
    "/records/{record_id}/manual-record",
    response_model=ReceiptRecordOut,
    summary="人工补录与确认单据信息"
)
def manual_update_record(
    record_id: int,
    payload: ManualRecordUpdateRequest,
    db: Session = Depends(get_db)
):
    record = db.query(ReceiptOcrRecord).filter(ReceiptOcrRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="未找到对应的识别记录")

    if payload.delivery_no is not None:
        record.delivery_no = payload.delivery_no
    if payload.sign_date is not None:
        record.sign_date = payload.sign_date
    if payload.sign_time is not None:
        record.sign_time = payload.sign_time

    # 标记为人工补录完成
    record.recognition_status = RecognitionStatus.MANUAL_RECORDED.value
    record.created_by = f"{record.created_by}|edit_by_{payload.operator}"

    db.commit()
    db.refresh(record)
    return record
