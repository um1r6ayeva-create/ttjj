# app/crud/global_duty.py
from sqlalchemy.orm import Session
from app.models.global_duty import GlobalDuty
from app.schemas.global_duty import GlobalDutyCreate
from typing import List

def create_global_duty(db: Session, duty: GlobalDutyCreate, assigned_by_id: int) -> GlobalDuty:
    db_duty = GlobalDuty(**duty.dict(), assigned_by_id=assigned_by_id)
    db.add(db_duty)
    db.commit()
    db.refresh(db_duty)
    return db_duty

def get_all_global_duties(db: Session) -> List[GlobalDuty]:
    return db.query(GlobalDuty).order_by(GlobalDuty.date_assigned.desc()).all()

def get_global_duty(db: Session, duty_id: int) -> GlobalDuty:
    return db.query(GlobalDuty).filter(GlobalDuty.id == duty_id).first()

def update_global_duty(db: Session, duty_id: int, duty_update: GlobalDutyCreate) -> GlobalDuty:
    db_duty = db.query(GlobalDuty).filter(GlobalDuty.id == duty_id).first()
    if not db_duty:
        return None
    
    for key, value in duty_update.dict().items():
        setattr(db_duty, key, value)
    
    db.commit()
    db.refresh(db_duty)
    return db_duty

def delete_global_duty(db: Session, duty_id: int) -> bool:
    duty = db.query(GlobalDuty).filter(GlobalDuty.id == duty_id).first()
    if not duty:
        return False
    db.delete(duty)
    db.commit()
    return True
