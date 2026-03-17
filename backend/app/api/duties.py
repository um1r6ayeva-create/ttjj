from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.db.session import get_db
from app.schemas.duty import DutyCreate, DutyUpdate, DutyResponse, DutyDetailResponse, DutyRoomResponse
from app.crud.crud_duty import (
    VALID_STATUSES,
    create_duty,
    get_duty,
    get_duties,
    update_duty,
    delete_duty,
    get_duties_by_room,
)
from app.models.user import User
from app.dependencies.auth import admin_or_student_required, commandant_required, admin_required, get_current_user, student_required
from app.models.duty import Duty
from app.models.duty_report import DutyReport

router = APIRouter()

@router.post("/", response_model=DutyResponse)
def assign_duty(
    duty_in: DutyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    duty = create_duty(db, duty_in, assigned_by_id=current_user.id)
    db.refresh(duty)
    
    return DutyResponse(
        id=duty.id,
        duty_type=duty.duty_type,
        room_number=duty.room_number,
        floor=duty.floor,
        date_assigned=duty.date_assigned,
        date_due=duty.date_due,
        status=duty.status,
        notes=duty.notes,
        assigned_by_id=duty.assigned_by_id,
    )

@router.get("/", response_model=List[DutyResponse])
def get_all_duties(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
    skip: int = 0,
    limit: int = 100,
    room_number: Optional[int] = Query(None),
    floor: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    duty_type: Optional[str] = Query(None),
):
    duties = get_duties(db, skip, limit, room_number, floor, status, duty_type)
    
    return [
        DutyResponse(
            id=d.id,
            duty_type=d.duty_type,
            room_number=d.room_number,
            floor=d.floor,
            date_assigned=d.date_assigned,
            date_due=d.date_due,
            status=d.status,
            notes=d.notes,
            assigned_by_id=d.assigned_by_id,
        )
        for d in duties
    ]

@router.get("/room/{room_number}", response_model=List[DutyRoomResponse])
def get_duties_by_room_number(
    room_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_student_required),
):
    if not current_user.is_admin and current_user.n_room != room_number:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Вы можете просматривать только дежурства своей комнаты"
        )
    
    duties = get_duties_by_room(db, room_number)
    
    duty_responses = []
    for duty in duties:
        student_report = db.query(DutyReport).filter(
            DutyReport.duty_id == duty.id,
            DutyReport.student_id == current_user.id
        ).first()
        
        duty_responses.append(DutyRoomResponse(
            id=duty.id,
            duty_type=duty.duty_type,
            room_number=duty.room_number,
            floor=duty.floor,
            date_assigned=duty.date_assigned,
            date_due=duty.date_due,
            status=duty.status,
            notes=duty.notes,
            assigned_by_id=duty.assigned_by_id,
            has_student_report=student_report is not None,
            student_report_status=student_report.status if student_report else None,
        ))
    
    return duty_responses

@router.get("/{duty_id}", response_model=DutyDetailResponse)
def get_duty_by_id(
    duty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
):
    duty = get_duty(db, duty_id)
    if not duty:
        raise HTTPException(status_code=404, detail="Дежурство не найдено")
    
    reports = db.query(DutyReport).filter(DutyReport.duty_id == duty_id).all()
    
    return DutyDetailResponse(
        id=duty.id,
        duty_type=duty.duty_type,
        room_number=duty.room_number,
        floor=duty.floor,
        date_assigned=duty.date_assigned,
        date_due=duty.date_due,
        status=duty.status,
        notes=duty.notes,
        assigned_by_id=duty.assigned_by_id,
        reports_count=len(reports),
        created_at=duty.created_at,
        updated_at=duty.updated_at,
    )

@router.get("/commandant/pending", response_model=List[DutyResponse])
def get_pending_duties_for_commandant(
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
    skip: int = 0,
    limit: int = 100,
):
    duties_with_reports = db.query(Duty).join(DutyReport).filter(
        DutyReport.status == "waiting"
    ).offset(skip).limit(limit).all()
    
    return [
        DutyResponse(
            id=d.id,
            duty_type=d.duty_type,
            room_number=d.room_number,
            floor=d.floor,
            date_assigned=d.date_assigned,
            date_due=d.date_due,
            status=d.status,
            notes=d.notes,
            assigned_by_id=d.assigned_by_id,
        )
        for d in duties_with_reports
    ]

@router.get("/commandant/completed", response_model=List[dict])
def get_completed_duties_for_commandant(
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
    skip: int = 0,
    limit: int = 100,
):
    reports = db.query(DutyReport).options(
        joinedload(DutyReport.student),
        joinedload(DutyReport.duty),
        joinedload(DutyReport.reviewer)
    ).filter(
        DutyReport.status.in_(["confirmed", "rejected"])
    ).order_by(
        DutyReport.reviewed_at.desc()
    ).offset(skip).limit(limit).all()
    
    completed_reports = []
    for report in reports:
        completed_reports.append({
            "id": report.id,
            "duty_id": report.duty_id,
            "duty_type": report.duty.duty_type if report.duty else None,
            "room_number": report.duty.room_number if report.duty else None,
            "floor": report.duty.floor if report.duty else None,
            "student_id": report.student_id,
            "student_name": f"{report.student.name} {report.student.surname}" if report.student else None,
            "description": report.description,
            "submitted_at": report.submitted_at,
            "reviewed_at": report.reviewed_at,
            "status": report.status,
            "reviewer_name": f"{report.reviewer.name} {report.reviewer.surname}" if report.reviewer else None,
            "review_notes": report.review_notes
        })
    
    return completed_reports

@router.get("/commandant/all", response_model=List[DutyResponse])
def get_all_duties_for_commandant(
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None),
    room_number: Optional[int] = Query(None),
):
    query = db.query(Duty).distinct().join(DutyReport)
    
    if status:
        query = query.filter(Duty.status == status)
    if room_number:
        query = query.filter(Duty.room_number == room_number)
    
    duties = query.offset(skip).limit(limit).all()
    
    return [
        DutyResponse(
            id=d.id,
            duty_type=d.duty_type,
            room_number=d.room_number,
            floor=d.floor,
            date_assigned=d.date_assigned,
            date_due=d.date_due,
            status=d.status,
            notes=d.notes,
            assigned_by_id=d.assigned_by_id,
        )
        for d in duties
    ]

@router.put("/{duty_id}", response_model=DutyResponse)
def update_duty_by_id(
    duty_id: int,
    duty_in: DutyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    duty = update_duty(db, duty_id, duty_in)
    if not duty:
        raise HTTPException(status_code=404, detail="Дежурство не найдено")
    
    db.refresh(duty)
    return DutyResponse(
        id=duty.id,
        duty_type=duty.duty_type,
        room_number=duty.room_number,
        floor=duty.floor,
        date_assigned=duty.date_assigned,
        date_due=duty.date_due,
        status=duty.status,
        notes=duty.notes,
        assigned_by_id=duty.assigned_by_id,
    )

@router.delete("/{duty_id}")
def delete_duty_by_id(
    duty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    success = delete_duty(db, duty_id)
    if not success:
        raise HTTPException(status_code=404, detail="Дежурство не найдено")
    return {"message": "Дежурство успешно удалено"}

@router.patch("/{duty_id}/status", response_model=DutyResponse)
def update_duty_status(
    duty_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
):
    duty = get_duty(db, duty_id)
    if not duty:
        raise HTTPException(status_code=404, detail="Дежурство не найдено")
    
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Некорректный статус: {status}")
    
    report_exists = db.query(DutyReport).filter(DutyReport.duty_id == duty_id).first()
    if report_exists and duty.status == "pending":
        duty.status = "submitted"
    elif status == "confirmed" and not report_exists:
        raise HTTPException(
            status_code=400, 
            detail="Нельзя подтвердить дежурство без отчета"
        )
    else:
        duty.status = status
    
    duty.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(duty)
    
    return DutyResponse(
        id=duty.id,
        duty_type=duty.duty_type,
        room_number=duty.room_number,
        floor=duty.floor,
        date_assigned=duty.date_assigned,
        date_due=duty.date_due,
        status=duty.status,
        notes=duty.notes,
        assigned_by_id=duty.assigned_by_id,
    )

@router.post("/{duty_id}/confirm", response_model=DutyResponse)
def confirm_duty_completion(
    duty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(commandant_required),
):
    duty = get_duty(db, duty_id)
    if not duty:
        raise HTTPException(status_code=404, detail="Дежурство не найдено")
    
    report_exists = db.query(DutyReport).filter(DutyReport.duty_id == duty_id).first()
    if not report_exists:
        raise HTTPException(
            status_code=400, 
            detail="Нельзя подтвердить дежурство без отчета"
        )
    
    duty.status = "confirmed"
    duty.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(duty)
    
    return DutyResponse(
        id=duty.id,
        duty_type=duty.duty_type,
        room_number=duty.room_number,
        floor=duty.floor,
        date_assigned=duty.date_assigned,
        date_due=duty.date_due,
        status=duty.status,
        notes=duty.notes,
        assigned_by_id=duty.assigned_by_id,
    )