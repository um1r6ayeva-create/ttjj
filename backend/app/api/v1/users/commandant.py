from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.application import Application
from app.models.duty import Duty
from app.models.duty_report import DutyReport
from app.models.global_duty import GlobalDuty
from app.models.duty_status_history import DutyStatusHistory
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
    # Используем outerjoin, чтобы включить старых пользователей без явно заданной роли
    users = db.query(User).outerjoin(User.role).filter(
        (User.role.has(name="student")) | 
        (User.role.has(name="admin")) |
        (User.role_id == None) |
        (User.role_id == 3) # 3 is student
    ).all()

    return [
        UserResponse(
            id=u.id,
            phone=u.phone,
            name=u.name,
            surname=u.surname,
            email=u.email,
            user_group=u.user_group,
            n_room=u.n_room,
            role=u.role.name if u.role else "student",
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
    
    # Сначала удаляем все связанные записи, чтобы избежать ошибки foreign key constraint
    db.query(Application).filter(Application.user_id == user_id).delete(synchronize_session=False)
    db.query(DutyReport).filter(DutyReport.student_id == user_id).delete(synchronize_session=False)
    db.query(DutyReport).filter(DutyReport.reviewed_by == user_id).delete(synchronize_session=False)
    db.query(GlobalDuty).filter(GlobalDuty.assigned_by_id == user_id).delete(synchronize_session=False)
    db.query(DutyStatusHistory).filter(DutyStatusHistory.changed_by == user_id).delete(synchronize_session=False)
    db.query(Duty).filter(Duty.assigned_by_id == user_id).delete(synchronize_session=False)
    
    db.delete(user)
    db.commit()
    return {"detail": "Пользователь удален"}
