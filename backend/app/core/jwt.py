from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

def create_access_token(data: dict) -> str:
    """
    Создает JWT access токен
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_user_token(phone: str) -> str:
    """
    Создает токен для пользователя по phone
    """
    return create_access_token({"sub": phone})

def create_refresh_token(data: dict) -> str:
    """
    Создает refresh токен (30 дней)
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)