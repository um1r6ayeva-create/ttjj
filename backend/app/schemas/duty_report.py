from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from enum import Enum

# --- Enums ---
class ReportStatus(str, Enum):
    WAITING = "waiting"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"

# --- Базовые схемы ---
class ReportPhotoBase(BaseModel):
    photo_url: str
    file_name: Optional[str] = None
    uploaded_at: datetime

class ReportPhotoCreate(BaseModel):
    photo_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class ReportPhotoResponse(ReportPhotoBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Схемы для отчетов ---
class DutyReportBase(BaseModel):
    description: str = Field(..., min_length=10, max_length=1000)
    duty_id: int

class DutyReportCreate(DutyReportBase):
    pass

class DutyReportUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    status: Optional[ReportStatus] = None

class DutyReportResponse(BaseModel):
    id: int
    duty_id: int
    student_id: int
    description: str
    submitted_at: datetime
    status: str
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    review_notes: Optional[str] = None
    photos: List[ReportPhotoResponse] = []
    student_name: Optional[str] = None
    room_number: Optional[int] = None
    floor: Optional[int] = None
    class Config:
        from_attributes = True

class DutyReportDetailResponse(DutyReportResponse):
    duty_info: Optional[dict] = None
    reviewer_name: Optional[str] = None

# --- Схема для проверки отчета ---
class DutyReportReview(BaseModel):
    status: ReportStatus
    review_notes: Optional[str] = Field(None, max_length=500)

# --- Схема для фильтрации отчетов ---
class DutyReportFilter(BaseModel):
    status: Optional[ReportStatus] = None
    duty_id: Optional[int] = None
    student_id: Optional[int] = None
    room_number: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None