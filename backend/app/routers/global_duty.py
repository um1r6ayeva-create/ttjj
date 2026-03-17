# app/routers/global_duty.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.db.database import get_db
from app.schemas.global_duty import GlobalDutyCreate, GlobalDutyOut, GlobalDutyUpdate
from app.crud import global_duty as crud_global
from app.dependencies.auth import get_current_user, commandant_required

router = APIRouter(
    prefix="/global-duties",
    tags=["Global Duties"],
)

# Получить все глобальные дежурства
@router.get("/", response_model=List[GlobalDutyOut])
def list_global_duties(db: Session = Depends(get_db)):
    return crud_global.get_all_global_duties(db)

# Создать новое глобальное дежурство (только командант)
@router.post("/", response_model=GlobalDutyOut, dependencies=[Depends(commandant_required)])
def create_global_duty(duty: GlobalDutyCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud_global.create_global_duty(db, duty, assigned_by_id=user.id)

# Получить конкретное дежурство
@router.get("/{duty_id}", response_model=GlobalDutyOut)
def get_global_duty(duty_id: int, db: Session = Depends(get_db)):
    db_duty = crud_global.get_global_duty(db, duty_id)
    if not db_duty:
        raise HTTPException(status_code=404, detail="GlobalDuty not found")
    return db_duty

# Удалить дежурство (только командант)
@router.delete("/{duty_id}", dependencies=[Depends(commandant_required)])
def delete_global_duty(duty_id: int, db: Session = Depends(get_db)):
    success = crud_global.delete_global_duty(db, duty_id)
    if not success:
        raise HTTPException(status_code=404, detail="GlobalDuty not found")
    return {"detail": "GlobalDuty deleted"}

@router.put("/{duty_id}", response_model=GlobalDutyOut, dependencies=[Depends(commandant_required)])
def update_global_duty(duty_id: int, duty: GlobalDutyUpdate, db: Session = Depends(get_db)):
    updated_duty = crud_global.update_global_duty(db, duty_id, duty)
    if not updated_duty:
        raise HTTPException(status_code=404, detail="GlobalDuty not found")
    return updated_duty