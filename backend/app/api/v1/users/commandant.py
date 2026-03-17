from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.dependencies.auth import admin_required, commandant_required

router = APIRouter(prefix="/commandant", tags=["Commandant Users"])

@router.get("/students", response_model=List[UserResponse])
def get_students_for_commandant(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    """
    Возвращает всех студентов
    """
    students = db.query(User).join(User.role).filter(User.role.has(name="student")).all()

    return [
        UserResponse(
            id=s.id,
            phone=s.phone,
            name=s.name,
            surname=s.surname,
            email=s.email,
            user_group=s.user_group,
            n_room=s.n_room,
            role=s.role.name,
            is_active=s.is_active
        )
        for s in students
    ]
