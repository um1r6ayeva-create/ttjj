from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Index
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class ReportPhoto(Base):
    __tablename__ = "report_photos"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("duty_reports.id"), nullable=False)
    photo_url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Дополнительные поля для контроля
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)  # размер в байтах
    mime_type = Column(String(50), nullable=True)  # image/jpeg, image/png и т.д.

    report = relationship("DutyReport", back_populates="photos")

    # Индексы
    __table_args__ = (
        Index('idx_photo_report', 'report_id'),
    )