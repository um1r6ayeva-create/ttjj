from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class DutyBase(BaseModel):
    duty_type: str
    room_number: int
    floor: int
    date_due: datetime
    notes: Optional[str] = None
    status: str = "pending"

class DutyCreate(DutyBase):
    pass

class DutyUpdate(BaseModel):
    duty_type: Optional[str] = None
    room_number: Optional[int] = None
    floor: Optional[int] = None
    date_due: Optional[datetime] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class DutyResponse(DutyBase):
    id: int
    date_assigned: datetime
    assigned_by_id: int
    
    class Config:
        from_attributes = True

class DutyRoomResponse(DutyResponse):
    has_student_report: bool = False
    student_report_status: Optional[str] = None

class DutyDetailResponse(DutyResponse):
    assigned_by_id: int
    reports_count: int = 0
    created_at: datetime
    updated_at: datetime