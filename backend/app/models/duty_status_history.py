# backend/app/models/duty_status_history.py
from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from app.db.base_class import Base
from datetime import datetime

class DutyStatusHistory(Base):
    __tablename__ = "duty_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    duty_id = Column(Integer, ForeignKey("duties.id"), nullable=False)
    old_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # Можно добавить relationship если нужно
    # duty = relationship("Duty")
    # changer = relationship("User")