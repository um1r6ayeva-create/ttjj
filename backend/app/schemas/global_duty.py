# app/schemas/global_duty.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class GlobalDutyBase(BaseModel):
    duty_type: str
    date_assigned: date
    notes: Optional[str] = None

class GlobalDutyCreate(GlobalDutyBase):
    pass

class GlobalDutyUpdate(BaseModel):
    duty_type: str
    date_assigned: date
    notes: Optional[str] = None

class GlobalDutyOut(GlobalDutyBase):
    id: int
    assigned_by_id: int

    class Config:
        orm_mode = True
