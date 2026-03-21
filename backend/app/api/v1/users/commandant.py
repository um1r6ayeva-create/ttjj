from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.dependencies.auth import (
    admin_required,
    commandant_required,
    any_admin_required
)

router = APIRouter(prefix="/commandant", tags=["Commandant Users"])

@router.get("/students", response_model=List[UserResponse])
def get_students_for_commandant(
    db: Session = Depends(get_db),
    current_user: User = Depends(any_admin_required),
):
    """
    Возвращает всех студентов и администраторов (для управления)
    """
    users = db.query(User).join(User.role).filter(User.role.name.in_(["student", "admin"])).all()

    return [
        UserResponse(
            id=u.id,
            phone=u.phone,
            name=u.name,
            surname=u.surname,
            email=u.email,
            user_group=u.user_group,
            n_room=u.n_room,
            role=u.role.name,
            is_active=u.is_active
        )
        for u in users
    ]

@router.post("/{user_id}/approve", response_model=UserResponse)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
):
    """
    Подтверждение регистрации пользователя
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}/reject")
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
):
    """
    Отклонение регистрации (удаление пользователя)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    
    db.delete(user)
    db.commit()
    return {"detail": "Пользователь удален"}
