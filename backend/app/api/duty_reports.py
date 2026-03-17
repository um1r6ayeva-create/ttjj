from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status as http_status, Query
from sqlalchemy.orm import Session, joinedload
from pathlib import Path
import shutil
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.duty import Duty
from app.models.duty_report import DutyReport
from app.models.report_photo import ReportPhoto
from app.schemas.duty_report import (
    DutyReportResponse, 
    DutyReportDetailResponse,
    ReportPhotoResponse,
    DutyReportReview,
    ReportStatus
)
from app.dependencies.auth import admin_or_student_required, get_current_user, student_required, admin_or_commandant_required

router = APIRouter()

# Директория для загрузки фото
UPLOAD_DIR = Path("uploads/duty_reports")
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# --- Создать директорию для загрузок ---
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def validate_photo_file(photo: UploadFile) -> bool:
    """Валидация файла фото."""
    # Проверка расширения
    file_ext = Path(photo.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Проверка MIME типа
    if not photo.content_type or not photo.content_type.startswith('image/'):
        return False
    
    return True
def save_uploaded_file(upload_file: UploadFile, destination: Path) -> dict:
    """Сохранить загруженный файл."""
    file_ext = Path(upload_file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"  # UUID имя!
    file_path = destination / unique_filename  # Сохраняем в destination/UUID.ext
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return {
        "file_path": file_path,  # Полный путь к файлу
        "filename": unique_filename,  # UUID имя
        "original_filename": upload_file.filename,
        "size": file_path.stat().st_size,
        "mime_type": upload_file.content_type
    }

# --- Отправить отчет о дежурстве ---
@router.post("/", response_model=DutyReportResponse)
async def submit_duty_report(
    duty_id: int = Form(...),
    description: str = Form(...),
    photos: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_student_required),
):
    """
    Отправить отчет о выполнении дежурства.
    """
    # Проверяем дежурство
    duty = db.query(Duty).filter(Duty.id == duty_id).first()
    if not duty:
        raise HTTPException(status_code=404, detail="Дежурство не найдено")
    
    # Проверяем, что дежурство для комнаты студента
    if current_user.n_room != duty.room_number:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Вы можете отправлять отчеты только за дежурства своей комнаты"
        )
    
    # Проверяем статус дежурства
    if duty.status not in ["pending", "expired"]:
        raise HTTPException(
            status_code=400,
            detail=f"Нельзя отправить отчет для дежурства со статусом '{duty.status}'"
        )
    
    # Проверяем, не отправил ли уже студент отчет
    existing_report = db.query(DutyReport).filter(
        DutyReport.duty_id == duty_id,
        DutyReport.student_id == current_user.id
    ).first()
    
    if existing_report:
        raise HTTPException(
            status_code=400,
            detail="Вы уже отправили отчет по этому дежурству"
        )
    
    # Проверяем фото
    if len(photos) < 3:
        raise HTTPException(status_code=400, detail="Необходимо загрузить минимум 3 фотографии")
    if len(photos) > 5:
        raise HTTPException(status_code=400, detail="Максимальное количество фотографий - 5")
    
    # Валидация файлов
    valid_photos = []
    for photo in photos:
        # Проверка валидности файла
        if not validate_photo_file(photo):
            raise HTTPException(
                status_code=400,
                detail=f"Недопустимый формат файла {photo.filename}. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Проверка размера файла
        photo.file.seek(0, 2)  # Перейти в конец файла
        file_size = photo.file.tell()
        photo.file.seek(0)  # Вернуться в начало
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Файл {photo.filename} слишком большой. Максимальный размер: 10MB"
            )
        
        valid_photos.append(photo)
    
    try:
        # Создаем отчет
        report = DutyReport(
            duty_id=duty_id,
            student_id=current_user.id,
            description=description,
            submitted_at=datetime.utcnow(),
            status="waiting"
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        # Создаем директорию для фото этого отчета
        report_dir = UPLOAD_DIR / str(report.id)
        report_dir.mkdir(exist_ok=True)
        
        # Сохраняем фото
        saved_photos = []
        for i, photo in enumerate(valid_photos):
            # Сохраняем файл
            file_info = save_uploaded_file(photo, report_dir)
            
            # Сохраняем в базу данных
            photo_record = ReportPhoto(
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
        
        # Обновляем статус дежурства, если это первый отчет
        if duty.status == "pending":
            duty.status = "submitted"
            duty.updated_at = datetime.utcnow()
            db.commit()
        
        # Получаем полные данные отчета с фото
        db.refresh(report)
        photos_response = [
            ReportPhotoResponse(
                id=photo.id,
                photo_url=f"/uploads/{photo.photo_url}",
                file_name=photo.file_name,
                uploaded_at=photo.uploaded_at
            )
            for photo in saved_photos
        ]
        
        return DutyReportResponse(
            id=report.id,
            duty_id=report.duty_id,
            student_id=report.student_id,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos_response,
            student_name=f"{current_user.name} {current_user.surname}"
        )
        
    except Exception as e:
        db.rollback()
        # Удаляем созданные файлы в случае ошибки
        report_dir = UPLOAD_DIR / str(report.id) if 'report' in locals() else None
        if report_dir and report_dir.exists():
            shutil.rmtree(report_dir)
        
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при сохранении отчета: {str(e)}"
        )

# --- Получить отчеты для проверки (для команданта) ---
@router.get("/pending", response_model=List[DutyReportResponse])
def get_pending_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_commandant_required),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200)
):
    """
    Получить отчеты, ожидающие проверки.
    """
    reports = db.query(DutyReport).options(
        joinedload(DutyReport.photos),
        joinedload(DutyReport.student),
        joinedload(DutyReport.duty)
    ).filter(
        DutyReport.status == "waiting"
    ).order_by(
        DutyReport.submitted_at
    ).offset(skip).limit(limit).all()
    
    reports_response = []
    for report in reports:
        photos_response = [
            ReportPhotoResponse(
                id=photo.id,
                photo_url=f"/uploads/{photo.photo_url}",
                file_name=photo.file_name,
                uploaded_at=photo.uploaded_at
            )
            for photo in report.photos
        ]
        
        reports_response.append(DutyReportResponse(
            id=report.id,
            duty_id=report.duty_id,
            student_id=report.student_id,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos_response,
            student_name=f"{report.student.name} {report.student.surname}" if report.student else "Неизвестный студент",
            room_number=report.duty.room_number if report.duty else None,
            floor=report.duty.floor if report.duty else None
        ))
    
    return reports_response

# --- Получить все отчеты (с фильтрацией) ---
@router.get("/", response_model=List[DutyReportResponse])
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_commandant_required),
    status: Optional[str] = Query(None),
    duty_id: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    room_number: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200)
):
    """
    Получить все отчеты с возможностью фильтрации.
    """
    query = db.query(DutyReport).options(
        joinedload(DutyReport.photos),
        joinedload(DutyReport.student),
        joinedload(DutyReport.duty)
    )
    
    # Применяем фильтры
    if status:
        query = query.filter(DutyReport.status == status)
    if duty_id:
        query = query.filter(DutyReport.duty_id == duty_id)
    if student_id:
        query = query.filter(DutyReport.student_id == student_id)
    if room_number:
        query = query.join(Duty).filter(Duty.room_number == room_number)
    
    reports = query.order_by(
        DutyReport.submitted_at.desc()
    ).offset(skip).limit(limit).all()
    
    reports_response = []
    for report in reports:
        photos_response = [
            ReportPhotoResponse(
                id=photo.id,
                photo_url=f"/uploads/{photo.photo_url}",
                file_name=photo.file_name,
                uploaded_at=photo.uploaded_at
            )
            for photo in report.photos
        ]
        
        reports_response.append(DutyReportResponse(
            id=report.id,
            duty_id=report.duty_id,
            student_id=report.student_id,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos_response,
            student_name=f"{report.student.name} {report.student.surname}" if report.student else "Неизвестный студент"
        ))
    
    return reports_response

# --- Получить отчет по ID ---
@router.get("/{report_id}", response_model=DutyReportDetailResponse)
def get_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Получить детальную информацию об отчете.
    """
    report = db.query(DutyReport).options(
        joinedload(DutyReport.photos),
        joinedload(DutyReport.student),
        joinedload(DutyReport.duty),
        joinedload(DutyReport.reviewer)
    ).filter(DutyReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Отчет не найден")
    
    # Проверяем права доступа
    can_view = (
        report.student_id == current_user.id or  # Свой отчет
        current_user.is_admin() or  # Администратор
        current_user.is_commandant()  # Командант
    )
    
    if not can_view:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав для просмотра этого отчета"
        )
    
    # Получаем фото
    photos_response = [
        ReportPhotoResponse(
            id=photo.id,
            photo_url=f"/uploads/{photo.photo_url}",
            file_name=photo.file_name,
            uploaded_at=photo.uploaded_at
        )
        for photo in report.photos
    ]
    
    # Получаем информацию о дежурстве
    duty_info = None
    if report.duty:
        duty_info = {
            "id": report.duty.id,
            "duty_type": report.duty.duty_type,
            "room_number": report.duty.room_number,
            "floor": report.duty.floor,
            "date_due": report.duty.date_due,
            "status": report.duty.status
        }
    
    return DutyReportDetailResponse(
        id=report.id,
        duty_id=report.duty_id,
        student_id=report.student_id,
        description=report.description,
        submitted_at=report.submitted_at,
        status=report.status,
        reviewed_at=report.reviewed_at,
        reviewed_by=report.reviewed_by,
        review_notes=report.review_notes,
        photos=photos_response,
        duty_info=duty_info,
        student_name=f"{report.student.name} {report.student.surname}" if report.student else "Неизвестный студент",
        reviewer_name=f"{report.reviewer.name} {report.reviewer.surname}" if report.reviewer else None
    )

# --- Проверить отчет ---
@router.post("/{report_id}/review", response_model=DutyReportResponse)
def review_report(
    report_id: int,
    review_data: DutyReportReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_commandant_required),
):
    """
    Проверить отчет (подтвердить или отклонить).
    """
    report = db.query(DutyReport).options(
        joinedload(DutyReport.duty)
    ).filter(DutyReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Отчет не найден")
    
    if report.status != "waiting":
        raise HTTPException(
            status_code=400,
            detail="Этот отчет уже проверен"
        )
    
    # Обновляем отчет
    report.status = review_data.status
    report.reviewed_at = datetime.utcnow()
    report.reviewed_by = current_user.id
    report.review_notes = review_data.review_notes
    
    # Обновляем статус дежурства
    if report.duty:
        if review_data.status == ReportStatus.CONFIRMED:
            report.duty.status = "confirmed"
        elif review_data.status == ReportStatus.REJECTED:
            report.duty.status = "rejected"
        
        report.duty.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(report)
    
    # Получаем фото для ответа
    photos = db.query(ReportPhoto).filter(ReportPhoto.report_id == report_id).all()
    photos_response = [
        ReportPhotoResponse(
            id=photo.id,
            photo_url=f"/uploads/{photo.photo_url}",
            file_name=photo.file_name,
            uploaded_at=photo.uploaded_at
        )
        for photo in photos
    ]
    
    return DutyReportResponse(
        id=report.id,
        duty_id=report.duty_id,
        student_id=report.student_id,
        description=report.description,
        submitted_at=report.submitted_at,
        status=report.status,
        reviewed_at=report.reviewed_at,
        reviewed_by=report.reviewed_by,
        review_notes=report.review_notes,
        photos=photos_response,
        student_name=f"{report.student.name} {report.student.surname}" if report.student else "Неизвестный студент"
    )

# --- Получить мои отчеты (для студента) ---
@router.get("/student/my-reports", response_model=List[DutyReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(student_required),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Получить все отчеты, отправленные текущим студентом.
    """
    reports = db.query(DutyReport).options(
        joinedload(DutyReport.photos),
        joinedload(DutyReport.duty)
    ).filter(
        DutyReport.student_id == current_user.id
    ).order_by(
        DutyReport.submitted_at.desc()
    ).offset(skip).limit(limit).all()
    
    reports_response = []
    for report in reports:
        photos_response = [
            ReportPhotoResponse(
                id=photo.id,
                photo_url=f"/uploads/{photo.photo_url}",
                file_name=photo.file_name,
                uploaded_at=photo.uploaded_at
            )
            for photo in report.photos
        ]
        
        reports_response.append(DutyReportResponse(
            id=report.id,
            duty_id=report.duty_id,
            student_id=report.student_id,
            description=report.description,
            submitted_at=report.submitted_at,
            status=report.status,
            reviewed_at=report.reviewed_at,
            reviewed_by=report.reviewed_by,
            review_notes=report.review_notes,
            photos=photos_response,
            student_name=f"{current_user.name} {current_user.surname}"
        ))
    
    return reports_response

# --- Удалить отчет (только если статус waiting и это свой отчет) ---
@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(student_required),
):
    """
    Удалить отчет (можно только если статус 'waiting').
    """
    report = db.query(DutyReport).filter(DutyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Отчет не найден")
    
    # Проверяем права
    if report.student_id != current_user.id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Вы можете удалять только свои отчеты"
        )
    
    # Проверяем статус
    if report.status != "waiting":
        raise HTTPException(
            status_code=400,
            detail="Можно удалять только отчеты со статусом 'waiting' (ожидает проверки)"
        )
    
    try:
        # Удаляем фото из файловой системы
        photos = db.query(ReportPhoto).filter(ReportPhoto.report_id == report_id).all()
        for photo in photos:
            photo_path = Path("uploads") / photo.photo_url
            if photo_path.exists():
                photo_path.unlink()
        
        # Удаляем директорию отчета
        report_dir = UPLOAD_DIR / str(report_id)
        if report_dir.exists():
            shutil.rmtree(report_dir)
        
        # Проверяем, остались ли отчеты по этому дежурству
        other_reports = db.query(DutyReport).filter(
            DutyReport.duty_id == report.duty_id,
            DutyReport.id != report_id
        ).count()
        
        # Если больше нет отчетов, обновляем статус дежурства
        if other_reports == 0 and report.duty:
            report.duty.status = "pending"
            report.duty.updated_at = datetime.utcnow()
        
        # Удаляем отчет из базы
        db.delete(report)
        db.commit()
        
        return {"message": "Отчет успешно удален"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении отчета: {str(e)}"
        )