from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.models.duty import Duty
from app.models.duty_report import DutyReport
from app.schemas.duty import DutyResponse
from app.schemas.user import UserResponse
from app.dependencies.auth import commandant_required

router = APIRouter(tags=["Commandant Duties"])

@router.get("/my-duties", response_model=List[DutyResponse])
def get_duties_for_commandant(
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
):
    """
    Комендант видит дежурства с привязанными комнатами и последним отчетом каждого студента
    """
    duties = (
        db.query(Duty)
        .options(joinedload(Duty.reports).joinedload(DutyReport.student))
        .all()
    )

    result = []
    for d in duties:
        # Студенты комнаты
        students_in_room = db.query(User).filter(User.n_room == d.room_number).all()
        assigned_to = [UserResponse.from_orm(s) for s in students_in_room]

        # Последний отчет студента в комнате
        last_report = None
        if d.reports:
            last_report = sorted(d.reports, key=lambda r: r.submitted_at)[-1]

        # Маппинг статусов
        status_map = {
            "reported": "waiting",      # студент отправил отчет
            "under_review": "waiting",  # на проверке
            "verified": "confirmed",    # проверено комендантом
        }
        duty_status = status_map.get(last_report.status, "assigned") if last_report else "assigned"

        assigned_by = UserResponse.from_orm(d.assigned_by) if d.assigned_by else None

        result.append(
            DutyResponse(
                id=d.id,
                duty_type=d.duty_type,
                room_number=d.room_number,
                floor=d.floor,
                date_assigned=d.date_assigned,
                date_due=d.date_due,
                status=duty_status,
                notes=d.notes,
                assigned_to=assigned_to,
                assigned_by=assigned_by,
            )
        )

    return result

