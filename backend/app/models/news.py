from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True)
    # Поля на разных языках
    title_ru = Column(String, nullable=False)
    title_uz = Column(String, nullable=False)
    title_en = Column(String, nullable=False)
    content_ru = Column(Text, nullable=False)
    content_uz = Column(Text, nullable=False)
    content_en = Column(Text, nullable=False)
    # Категории на разных языках
    category_ru = Column(String)
    category_uz = Column(String)
    category_en = Column(String)
    icon = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())