from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status as http_status, Query
from sqlalchemy.orm import Session, joinedload
from pathlib import Path
import shutil
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.global_duty import GlobalDuty
from app.models.global_duty_report import GlobalDutyReport, GlobalReportPhoto
from app.schemas.duty_report import ReportPhotoResponse, DutyReportReview, ReportStatus
from pydantic import BaseModel, ConfigDict
from app.dependencies.auth import admin_or_student_required, get_current_user, student_required, any_admin_required, admin_required

# --- Schemas ---

class GlobalDutyReportResponse(BaseModel):
    id: int
    global_duty_id: int
    student_id: int
    floor: int
    description: str
    submitted_at: datetime
    status: str
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    review_notes: Optional[str] = None
    photos: List[ReportPhotoResponse] = []
    student_name: str
    # Info about the duty
    duty_type: Optional[str] = None
    date_assigned: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FloorStatus(BaseModel):
    floor: int
    status: str
    report_id: Optional[int] = None

# --- Router ---
router = APIRouter(
    prefix="/global-duty-reports",
    tags=["Global Duty Reports"],
)

UPLOAD_DIR = Path("uploads/global_duty_reports")
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def validate_photo_file(photo: UploadFile) -> bool:
    file_ext = Path(photo.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    if not photo.content_type or not photo.content_type.startswith('image/'):
        return False
    return True

def save_uploaded_file(upload_file: UploadFile, destination: Path) -> dict:
    file_ext = Path(upload_file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = destination / unique_filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return {
        "file_path": file_path,
        "filename": unique_filename,
        "original_filename": upload_file.filename,
        "size": file_path.stat().st_size,
        "mime_type": upload_file.content_type
    }

@router.post("/", response_model=GlobalDutyReportResponse)
async def submit_global_duty_report(
    global_duty_id: int = Form(...),
    description: str = Form(...),
    photos: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required), # Только староста (admin) может отправить отчет
):
    """
    Отправить отчет об общем дежурстве (генеральная уборка/субботник).
    Староста отправляет отчет за свой этаж.
    """
    duty = db.query(GlobalDuty).filter(GlobalDuty.id == global_duty_id).first()
    if not duty:
        raise HTTPException(status_code=404, detail="Общее дежурство не найдено")
    
    # Староста должен иметь поле этаж (floor)
    if not current_user.floor:
        raise HTTPException(
            status_code=400,
            detail="У вас не указан этаж в профиле. Отправка отчета невозможна."
        )
    
    # Можно отправить только один отчет на этаж по одному дежурству?
    existing_report = db.query(GlobalDutyReport).filter(
        GlobalDutyReport.global_duty_id == global_duty_id,
        GlobalDutyReport.floor == current_user.floor
    ).first()
    
    if existing_report:
        raise HTTPException(
            status_code=400,
            detail=f"Отчет по этому дежурству для {current_user.floor} этажа уже отправлен"
        )
    
    if len(photos) < 3:
        raise HTTPException(status_code=400, detail="Необходимо загрузить минимум 3 фотографии")
    if len(photos) > 20: # Разрешаем до 20 фото
        raise HTTPException(status_code=400, detail="Максимальное количество фотографий - 20")
    
    valid_photos = []
    for photo in photos:
        if not validate_photo_file(photo):
            raise HTTPException(
                status_code=400,
                detail=f"Недопустимый формат файла {photo.filename}."
            )
        photo.file.seek(0, 2)
        file_size = photo.file.tell()
        photo.file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Файл {photo.filename} слишком большой."
            )
        valid_photos.append(photo)
    
    try:
        report = GlobalDutyReport(
            global_duty_id=global_duty_id,
            student_id=current_user.id,
            floor=current_user.floor,
            description=description,
            submitted_at=datetime.utcnow(),
            status="waiting"
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        report_dir = UPLOAD_DIR / str(report.id)
        report_dir.mkdir(exist_ok=True)
        
        saved_photos = []
        for photo in valid_photos:
            file_info = save_uploaded_file(photo, report_dir)
            photo_record = GlobalReportPhoto(
                report_id=report.id,
                photo_url=str(file_info["file_path"].relative_to("uploads")),
                file_name=file_info["original_filename"],
                file_size=file_info["size"],
                mime_type=file_info["mime_type"],
                uploaded_at=datetime.utcnow()
            )
            db.add(photo_record)
            saved_photos.append(photo_record)
        
        db.commit()
        db.refresh(report)
        
        photos_response = [
            ReportPhotoResponse(
                id=p.id, photo_url=f"/uploads/{p.photo_url}", file_name=p.file_name, uploaded_at=p.uploaded_at
            ) for p in saved_photos
        ]
        
        return GlobalDutyReportResponse(
            id=report.id,
            global_duty_id=report.global_duty_id,
            student_id=report.student_id,
            floor=report.floor,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos_response,
            student_name=f"{current_user.name} {current_user.surname}",
            duty_type=duty.duty_type,
            date_assigned=duty.date_assigned
        )
        
    except Exception as e:
        db.rollback()
        report_dir = UPLOAD_DIR / str(report.id) if 'report' in locals() else None
        if report_dir and report_dir.exists():
            shutil.rmtree(report_dir)
        raise HTTPException(status_code=500, detail=f"Ошибка при сохранении отчета: {str(e)}")

@router.get("/my", response_model=List[GlobalDutyReportResponse])
def get_my_global_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    """
    Получить отчеты текущего старосты.
    """
    reports = db.query(GlobalDutyReport).options(
        joinedload(GlobalDutyReport.photos),
        joinedload(GlobalDutyReport.global_duty)
    ).filter(
        GlobalDutyReport.student_id == current_user.id
    ).order_by(GlobalDutyReport.submitted_at.desc()).all()
    
    reports_response = []
    for report in reports:
        photos = [ReportPhotoResponse(id=p.id, photo_url=f"/uploads/{p.photo_url}", file_name=p.file_name, uploaded_at=p.uploaded_at) for p in report.photos]
        reports_response.append(GlobalDutyReportResponse(
            id=report.id,
            global_duty_id=report.global_duty_id,
            student_id=report.student_id,
            floor=report.floor,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos,
            student_name=f"{current_user.name} {current_user.surname}",
            duty_type=report.global_duty.duty_type if report.global_duty else None,
            date_assigned=report.global_duty.date_assigned if report.global_duty else None
        ))
    return reports_response

@router.get("/pending", response_model=List[GlobalDutyReportResponse])
def get_pending_global_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(any_admin_required),
):
    """
    Получить отчеты, ожидающие проверки.
    """
    reports = db.query(GlobalDutyReport).options(
        joinedload(GlobalDutyReport.photos),
        joinedload(GlobalDutyReport.student),
        joinedload(GlobalDutyReport.global_duty)
    ).filter(GlobalDutyReport.status == "waiting").order_by(GlobalDutyReport.submitted_at).all()
    
    reports_response = []
    for report in reports:
        photos = [ReportPhotoResponse(id=p.id, photo_url=f"/uploads/{p.photo_url}", file_name=p.file_name, uploaded_at=p.uploaded_at) for p in report.photos]
        reports_response.append(GlobalDutyReportResponse(
            id=report.id,
            global_duty_id=report.global_duty_id,
            student_id=report.student_id,
            floor=report.floor,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos,
            student_name=f"{report.student.name} {report.student.surname}" if report.student else "Неизвестный",
            duty_type=report.global_duty.duty_type if report.global_duty else None,
            date_assigned=report.global_duty.date_assigned if report.global_duty else None
        ))
    return reports_response

@router.post("/{report_id}/review", response_model=GlobalDutyReportResponse)
def review_global_report(
    report_id: int,
    review_data: DutyReportReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(any_admin_required),
):
    """
    Проверить отчет (подтвердить или отклонить).
    """
    report = db.query(GlobalDutyReport).options(
        joinedload(GlobalDutyReport.global_duty),
        joinedload(GlobalDutyReport.student)
    ).filter(GlobalDutyReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Отчет не найден")
    
    if report.status != "waiting":
        raise HTTPException(status_code=400, detail="Этот отчет уже проверен")
    
    report.status = review_data.status
    report.reviewed_at = datetime.utcnow()
    report.reviewed_by = current_user.id
    report.review_notes = review_data.review_notes
    
    db.commit()
    db.refresh(report)
    
    photos = db.query(GlobalReportPhoto).filter(GlobalReportPhoto.report_id == report_id).all()
    photos_response = [ReportPhotoResponse(id=p.id, photo_url=f"/uploads/{p.photo_url}", file_name=p.file_name, uploaded_at=p.uploaded_at) for p in photos]
    
    return GlobalDutyReportResponse(
        id=report.id,
        global_duty_id=report.global_duty_id,
        student_id=report.student_id,
        floor=report.floor,
        description=report.description,
        submitted_at=report.submitted_at,
        status=report.status,
        reviewed_at=report.reviewed_at,
        reviewed_by=report.reviewed_by,
        review_notes=report.review_notes,
        photos=photos_response,
        student_name=f"{report.student.name} {report.student.surname}" if report.student else "Неизвестный",
        duty_type=report.global_duty.duty_type if report.global_duty else None,
        date_assigned=report.global_duty.date_assigned if report.global_duty else None
    )

@router.get("/history", response_model=List[GlobalDutyReportResponse])
def get_global_reports_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(any_admin_required),
    status: Optional[str] = Query(None), # "confirmed" or "rejected"
):
    """
    Получить историю проверок общих дежурств.
    """
    query = db.query(GlobalDutyReport).options(
        joinedload(GlobalDutyReport.photos),
        joinedload(GlobalDutyReport.student),
        joinedload(GlobalDutyReport.global_duty)
    ).filter(GlobalDutyReport.status.in_(["confirmed", "rejected"]))
    
    if status:
        query = query.filter(GlobalDutyReport.status == status)
        
    reports = query.order_by(GlobalDutyReport.reviewed_at.desc()).all()
    
    reports_response = []
    for report in reports:
        photos = [ReportPhotoResponse(id=p.id, photo_url=f"/uploads/{p.photo_url}", file_name=p.file_name, uploaded_at=p.uploaded_at) for p in report.photos]
        
        # Получаем имя проверяющего (если есть)
        reviewer_name = "Неизвестно"
        if report.reviewed_by:
            reviewer = db.query(User).filter(User.id == report.reviewed_by).first()
            if reviewer:
                reviewer_name = f"{reviewer.name} {reviewer.surname}"

        reports_response.append(GlobalDutyReportResponse(
            id=report.id,
            global_duty_id=report.global_duty_id,
            student_id=report.student_id,
            floor=report.floor,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos,
            student_name=f"{report.student.name} {report.student.surname}" if report.student else "Неизвестный",
            duty_type=report.global_duty.duty_type if report.global_duty else None,
            date_assigned=report.global_duty.date_assigned if report.global_duty else None
        ))
    return reports_response

@router.get("/duty/{duty_id}/status", response_model=List[FloorStatus])
def get_duty_floors_status(
    duty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(any_admin_required),
):
    """
    Получить статус сдачи отчетов по этажам для конкретного общего дежурства.
    """
    reports = db.query(GlobalDutyReport).filter(GlobalDutyReport.global_duty_id == duty_id).all()
    report_map = {r.floor: r for r in reports}
    
    status_list = []
    for floor in range(2, 10): # Этажи 2-9
        report = report_map.get(floor)
        status_list.append(FloorStatus(
            floor=floor,
            status=report.status if report else "not_submitted",
            report_id=report.id if report else None
        ))
    
    return status_list
