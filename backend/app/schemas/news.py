# schemas/news.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Базовая схема для создания новости
class NewsBase(BaseModel):
    title_ru: str
    title_uz: str
    title_en: str
    content_ru: str
    content_uz: str
    content_en: str
    category: str  # Ключ из CATEGORY_MAP
    icon: str

class NewsCreate(NewsBase):
    pass

class NewsUpdate(BaseModel):
    title_ru: Optional[str] = None
    title_uz: Optional[str] = None
    title_en: Optional[str] = None
    content_ru: Optional[str] = None
    content_uz: Optional[str] = None
    content_en: Optional[str] = None
    category: Optional[str] = None  # Ключ из CATEGORY_MAP
    icon: Optional[str] = None

# Схема для ответа с полными данными
class NewsOut(BaseModel):
    id: int
    title_ru: str
    title_uz: str
    title_en: str
    content_ru: str
    content_uz: str
    content_en: str
    category_ru: str
    category_uz: str
    category_en: str
    icon: str
    created_at: datetime

    class Config:
        orm_mode = True
# Схема для фронтенда с текущим языком
class NewsFrontendOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    icon: str
    created_at: datetime
    author_name: Optional[str] = None
    author_position: Optional[str] = None

    class Config:
        orm_mode = True
