from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
# ИЗМЕНИ ИМПОРТ:
from app.schemas.application import ApplicationCreate, ApplicationResponse  # Импортируем напрямую из файла
from app.crud import application as crud_application
from app.utils.file_upload import save_uploaded_file, delete_file

router = APIRouter()

@router.post("/", response_model=ApplicationResponse)  # ИЗМЕНИЛ schemas.ApplicationResponse на просто ApplicationResponse
async def create_application(
    name: str = Form(...),
    surname: str = Form(...),
    n_room: int = Form(...),
    phone: str = Form(...),
    type: str = Form(...),
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Создать новую заявку
    - Загружает DOCX файл
    - Сохраняет основные данные студента
    - Записывает в БД
    """
    # Проверяем тип файла
    if not file.filename.endswith('.docx'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл должен быть в формате .docx"
        )
    
    # Проверяем тип заявки
    if type not in ['guarantee', 'application']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Тип заявки должен быть 'guarantee' или 'application'"
        )
    
    # Сохраняем файл
    file_path, original_filename = save_uploaded_file(file)
    
    # Создаем заявку
    application_data = ApplicationCreate(  # ИЗМЕНИЛ schemas.ApplicationCreate на ApplicationCreate
        user_id=user_id,
        name=name,
        surname=surname,
        n_room=n_room,
        phone=phone,
        type=type
    )
    
    application = crud_application.create_application(
        db=db,
        application=application_data,
        file_path=file_path,
        file_name=original_filename
    )
    
    return application

@router.get("/", response_model=List[ApplicationResponse])  # ИЗМЕНИЛ
def get_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Получить все заявки (для коменданта)
    """
    return crud_application.get_all_applications(db, skip=skip, limit=limit)

@router.get("/user/{user_id}", response_model=List[ApplicationResponse])  # ИЗМЕНИЛ
def get_user_applications(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Получить заявки конкретного пользователя
    """
    return crud_application.get_applications_by_user(db, user_id=user_id, skip=skip, limit=limit)

@router.get("/{application_id}", response_model=ApplicationResponse)  # ИЗМЕНИЛ
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Получить заявку по ID
    """
    application = crud_application.get_application(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    return application

@router.patch("/{application_id}/status", response_model=ApplicationResponse)  # ИЗМЕНИЛ
def update_application_status(
    application_id: int,
    status: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Обновить статус заявки (для коменданта)
    """
    valid_statuses = ["sent", "viewed", "approved", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Статус должен быть одним из: {', '.join(valid_statuses)}"
        )
    
    application = crud_application.update_application_status(db, application_id, status)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    return application

@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """
    Удалить заявку
    """
    application = crud_application.get_application(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    # Удаляем файл
    delete_file(application.file_path)
    
    # Удаляем запись из БД
    crud_application.delete_application(db, application_id)
    
    return {"message": "Заявка удалена"}