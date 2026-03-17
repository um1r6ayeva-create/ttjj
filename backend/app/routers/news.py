from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.news import News
from app.schemas.news import NewsCreate, NewsOut, NewsUpdate, NewsFrontendOut
from app.dependencies.auth import commandant_required
from typing import List

router = APIRouter(prefix="/news", tags=["News"])

CATEGORY_MAP = {
    "Общежитие": {"ru": "Общежитие", "uz": "Yotoqxona", "en": "Dormitory"},
    "Учеба": {"ru": "Учеба", "uz": "Ta'lim", "en": "Study"},
    "Спорт": {"ru": "Спорт", "uz": "Sport", "en": "Sport"},
    "Мероприятия": {"ru": "Мероприятия", "uz": "Tadbirlar", "en": "Events"},
    "Важное": {"ru": "Важное", "uz": "Muhim", "en": "Important"},
}

@router.post("/", response_model=NewsOut)
def create_news(
    data: NewsCreate,
    db: Session = Depends(get_db),
    commandant=Depends(commandant_required)
):
    if data.category not in CATEGORY_MAP:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    category = CATEGORY_MAP[data.category]

    news = News(
        title_ru=data.title_ru,
        title_uz=data.title_uz,
        title_en=data.title_en,
        content_ru=data.content_ru,
        content_uz=data.content_uz,
        content_en=data.content_en,
        category_ru=category["ru"],
        category_uz=category["uz"],
        category_en=category["en"],
        icon=data.icon
    )

    db.add(news)
    db.commit()
    db.refresh(news)
    return news


@router.get("/", response_model=List[NewsFrontendOut])
def get_news(
    request: Request,
    db: Session = Depends(get_db)
):
    # Получаем язык из query параметров
    lang = request.query_params.get('lang', 'ru')
    if lang not in ['ru', 'uz', 'en']:
        lang = 'ru'
    
    news_list = db.query(News).order_by(News.created_at.desc()).all()
    
    result = []
    for news in news_list:
        # Выбираем поля в зависимости от языка
        if lang == 'ru':
            title = news.title_ru
            content = news.content_ru
            category = news.category_ru
        elif lang == 'uz':
            title = news.title_uz
            content = news.content_uz
            category = news.category_uz
        else:  # en
            title = news.title_en
            content = news.content_en
            category = news.category_en
        
        result.append(NewsFrontendOut(
            id=news.id,
            title=title,
            content=content,
            category=category or "",  # Добавляем значение по умолчанию
            icon=news.icon,
            created_at=news.created_at,
            author_name="Администрация",
            author_position="Объявление"
        ))
    
    return result

@router.get("/all", response_model=List[NewsOut])
def get_all_news(db: Session = Depends(get_db)):
    """Получить все новости со всеми языками (для админки)"""
    return db.query(News).order_by(News.created_at.desc()).all()

@router.get("/{news_id}", response_model=NewsFrontendOut)
def get_news_by_id(
    news_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    lang = request.query_params.get('lang', 'ru')
    if lang not in ['ru', 'uz', 'en']:
        lang = 'ru'
    
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Выбираем поля в зависимости от языка
    if lang == 'ru':
        title = news.title_ru
        content = news.content_ru
        category = news.category_ru
    elif lang == 'uz':
        title = news.title_uz
        content = news.content_uz
        category = news.category_uz
    else:  # en
        title = news.title_en
        content = news.content_en
        category = news.category_en
    
    return NewsFrontendOut(
        id=news.id,
        title=title,
        content=content,
        category=category or "",
        icon=news.icon,
        created_at=news.created_at,
        author_name="Администрация",
        author_position="Объявление"
    )

@router.get("/{news_id}/full", response_model=NewsOut)
def get_news_full(
    news_id: int,
    db: Session = Depends(get_db)
):
    """Получить полную информацию о новости со всеми языками"""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    return news

@router.put("/{news_id}", response_model=NewsOut)
def update_news(
    news_id: int,
    data: NewsUpdate,
    db: Session = Depends(get_db),
    commandant=Depends(commandant_required)
):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(news, field, value)
    
    db.commit()
    db.refresh(news)
    return news

@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    commandant=Depends(commandant_required)
):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    db.delete(news)
    db.commit()
    return {"message": "News deleted successfully"}