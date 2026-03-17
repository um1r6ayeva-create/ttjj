from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import re

from app.schemas.role import Role  # Импортируем схему роли

class UserBase(BaseModel):
    name: str
    surname: str
    phone: str
    email: Optional[EmailStr] = None
    user_group: Optional[str] = None
    n_room: Optional[int] = None
    
    @field_validator('phone')
    def validate_phone(cls, v):
        if not re.match(r'^\+?[0-9]{10,15}$', v):
            raise ValueError('Неверный формат телефона')
        return v
    
    @field_validator('user_group')
    def validate_group(cls, v):
        if v:
            if not re.match(r'^\d{3}-\d{2}$', v):
                raise ValueError('Группа должна быть в формате: 222-22')
        return v

class UserCreate(UserBase):
    password: str
    role_id: int = 3  # По умолчанию студент
    
    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Пароль должен содержать минимум 6 символов')
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    user_group: Optional[str] = None
    n_room: Optional[int] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # Включаем from_orm

    id: int
    name: str
    surname: str
    phone: str
    email: Optional[str] = None
    user_group: Optional[str] = None
    n_room: Optional[int] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    role: str  # строка роли

    @classmethod
    def model_validate(cls, obj):
        # obj — это User, заменяем role объект на его name
        if hasattr(obj, "role") and obj.role:
            obj_dict = obj.__dict__.copy()
            obj_dict["role"] = obj.role.name
            return super().model_validate(obj_dict)
        return super().model_validate(obj)

# Для внутреннего использования с полной информацией о роли
class UserWithRole(UserBase):
    id: int
    role: Role  # Полная информация о роли
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True