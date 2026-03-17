# app/models/global_duty.py
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class GlobalDuty(Base):
    __tablename__ = "global_duties"

    id = Column(Integer, primary_key=True, index=True)
    duty_type = Column(String(50), nullable=False)  # 'general_cleaning' или 'community_work'
    date_assigned = Column(Date, nullable=False)
    assigned_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(String, nullable=True) 
    # relation к пользователю, который назначил дежурство
    assigned_by = relationship("User", backref="assigned_global_duties")
