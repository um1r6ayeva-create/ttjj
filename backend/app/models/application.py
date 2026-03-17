from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    n_room = Column(Integer, nullable=False)
    phone = Column(String(20), nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    type = Column(String(20), nullable=False)  # 'guarantee' или 'application'
    status = Column(String(20), default="sent", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())