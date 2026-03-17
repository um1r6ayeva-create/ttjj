from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ApplicationBase(BaseModel):
    name: str
    surname: str
    n_room: int
    phone: str
    type: str  # 'guarantee' или 'application'

class ApplicationCreate(ApplicationBase):
    user_id: int

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None

class ApplicationInDB(ApplicationBase):
    id: int
    user_id: int
    file_path: str
    file_name: str
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ApplicationResponse(ApplicationInDB):
    pass