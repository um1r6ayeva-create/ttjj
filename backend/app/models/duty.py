from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, String, Index
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Duty(Base):
    __tablename__ = "duties"

    id = Column(Integer, primary_key=True, index=True)
    duty_type = Column(String(50), nullable=False)
    room_number = Column(Integer, nullable=False)
    floor = Column(Integer, nullable=False)
    
    date_due = Column(DateTime, nullable=False)
    date_assigned = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assigned_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, submitted, confirmed, rejected, expired
    notes = Column(Text)

    assigned_by = relationship("User", foreign_keys=[assigned_by_id])
    
    reports = relationship(
        "DutyReport",
        back_populates="duty",
        cascade="all, delete-orphan",
        lazy="dynamic"  # для оптимизации запросов
    )

    # Индексы для оптимизации запросов
    __table_args__ = (
        Index('idx_duty_room_floor', 'room_number', 'floor'),
        Index('idx_duty_status_date', 'status', 'date_due'),
        Index('idx_duty_assigned_by', 'assigned_by_id'),
    )