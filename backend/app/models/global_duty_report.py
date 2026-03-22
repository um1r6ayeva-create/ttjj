from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, String, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class GlobalDutyReport(Base):
    __tablename__ = "global_duty_reports"

    id = Column(Integer, primary_key=True, index=True)
    global_duty_id = Column(Integer, ForeignKey("global_duties.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Староста
    floor = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="waiting", nullable=False)  # waiting, confirmed, rejected
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, nullable=True)

    global_duty = relationship("GlobalDuty", back_populates="reports")
    student = relationship("User", foreign_keys=[student_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    photos = relationship("GlobalReportPhoto", back_populates="report", cascade="all, delete-orphan")

    # Constraints: One report per floor per duty. Or per starosta per duty.
    __table_args__ = (
        UniqueConstraint('global_duty_id', 'floor', name='uq_gduty_floor'),
        Index('idx_greport_duty_floor', 'global_duty_id', 'floor'),
        Index('idx_greport_status', 'status'),
    )

class GlobalReportPhoto(Base):
    __tablename__ = "global_report_photos"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("global_duty_reports.id"), nullable=False)
    photo_url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(50), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("GlobalDutyReport", back_populates="photos")
