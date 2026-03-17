from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, String, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class DutyReport(Base):
    __tablename__ = "duty_reports"

    id = Column(Integer, primary_key=True, index=True)
    duty_id = Column(Integer, ForeignKey("duties.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="waiting", nullable=False)  # waiting, confirmed, rejected
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, nullable=True)

    duty = relationship("Duty", back_populates="reports")
    student = relationship("User", foreign_keys=[student_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    photos = relationship("ReportPhoto", back_populates="report", cascade="all, delete-orphan")

    # Ограничения
    __table_args__ = (
        UniqueConstraint('duty_id', 'student_id', name='uq_duty_student'),  # студент может отправить только один отчет на дежурство
        Index('idx_report_duty_student', 'duty_id', 'student_id'),
        Index('idx_report_status', 'status'),
        Index('idx_report_submitted', 'submitted_at'),
    )