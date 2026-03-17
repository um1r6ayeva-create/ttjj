# backend/app/api/v1/users/profile.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, ChangePasswordRequest
from app.core.security import hash_password, verify_password
from app.dependencies.auth import get_current_user

router = APIRouter()


# --- Вспомогательная функция для конвертации User в UserResponse ---
def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        phone=user.phone,
        name=user.name,
        surname=user.surname,
        email=user.email,
        user_group=user.user_group,
        n_room=user.n_room,
        role=user.role.name if user.role else "unknown",  # <- исправлено
        is_active=user.is_active
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_data(current_user: User = Depends(get_current_user)):
    """
    Получить данные текущего пользователя
    """
    return user_to_response(current_user)


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновить данные текущего пользователя
    """
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    # Проверка email, если обновляется
    if user_update.email and user_update.email != user.email:
        existing_email = db.query(User).filter(
            User.email == user_update.email,
            User.id != user.id
        ).first()
        if existing_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь с таким email уже существует")

    # Обновление полей через Pydantic dict
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)

    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ошибка при обновлении пользователя: {str(e)}")

    return user_to_response(user)

@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Сменить пароль текущего пользователя
    """
    # Получаем актуального пользователя из базы
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if not verify_password(data.old_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Старый пароль неверный")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Новый пароль должен содержать минимум 6 символов")

    user.password_hash = hash_password(data.new_password)
    db.commit()
    db.refresh(user)

    return {"message": "Пароль успешно изменён"}

