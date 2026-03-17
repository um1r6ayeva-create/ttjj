# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    user_group = Column(String(10), nullable=True)
    n_room = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, default=3)
    
    # Основные отношения
    role = relationship("Role", back_populates="users")
    
    # Обратные связи для дежурств
    # 1. Дежурства, которые пользователь назначил (как администратор/комендант)
    assigned_duties = relationship(
        "Duty", 
        foreign_keys="Duty.assigned_by_id",
        back_populates="assigned_by",
        cascade="all, delete-orphan"
    )
    
    # 2. Отчеты, которые пользователь отправил (как студент)
    duty_reports = relationship(
        "DutyReport",
        foreign_keys="DutyReport.student_id",
        back_populates="student",
        cascade="all, delete-orphan"
    )
    
    # 3. Отчеты, которые пользователь проверил (как комендант)
    reviewed_reports = relationship(
        "DutyReport", 
        foreign_keys="DutyReport.reviewed_by",
        back_populates="reviewer",
        cascade="all, delete-orphan"
    )
    
    # 4. История изменений статусов (если создали модель DutyStatusHistory)
    # status_changes = relationship(
    #     "DutyStatusHistory",
    #     foreign_keys="DutyStatusHistory.changed_by",
    #     back_populates="changer"
    # )
    
    # --- Добавляем свойство для Pydantic ---
    @property
    def role_name(self) -> str:
        return self.role.name if self.role else "Unknown"
    
    # --- Вспомогательные методы ---
    @property
    def full_name(self) -> str:
        return f"{self.name} {self.surname}"
    
    def is_admin(self) -> bool:
        return self.role.name.lower() == "admin" if self.role else False
    
    def is_commandant(self) -> bool:
        return self.role.name.lower() == "commandant" if self.role else False
    
    def is_student(self) -> bool:
        return self.role.name.lower() == "student" if self.role else False
    
    def can_assign_duties(self) -> bool:
        """Может ли пользователь назначать дежурства"""
        return self.is_admin() or self.is_commandant()
    
    def can_review_reports(self) -> bool:
        """Может ли пользователь проверять отчеты"""
        return self.is_admin() or self.is_commandant()