from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.models.user import User
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.core.config import settings

# OAuth2 схема для получения токена из запроса
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Получает текущего пользователя из JWT токена
    В токене должен быть phone как subject (sub)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Декодируем токен
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Получаем phone из токена (subject)
        phone: str = payload.get("sub")
        
        # Проверяем тип токена
        token_type = payload.get("type")
        
        if not phone:
            raise credentials_exception
            
        # Проверяем, что это access токен
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный тип токена",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    except JWTError:
        raise credentials_exception
    
    # Ищем пользователя по phone (уникальному идентификатору)
    user = db.query(User).filter(User.phone == phone).first()
    
    if user is None:
        raise credentials_exception
    
    # Проверяем, что пользователь активен
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Аккаунт деактивирован"
        )
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Дополнительная проверка, что пользователь активен
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Аккаунт деактивирован"
        )
    return current_user

def role_required(role_name: str):
    """
    Зависимость для проверки конкретной роли
    """
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role.name != role_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ запрещен. Требуется роль: {role_name}"
            )
        return current_user
    return role_checker

# Конкретные зависимости для ролей
def admin_required(current_user: User = Depends(get_current_active_user)) -> User:
    """Только для администраторов (старост)"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: только для администраторов"
        )
    return current_user

def commandant_required(current_user: User = Depends(get_current_active_user)) -> User:
    """Только для комендантов"""
    if current_user.role.name != "commandant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: только для комендантов"
        )
    return current_user

def student_required(current_user: User = Depends(get_current_active_user)) -> User:
    """Только для студентов"""
    if current_user.role.name != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: только для студентов"
        )
    return current_user

# Для нескольких ролей
def admin_or_commandant_required(current_user: User = Depends(get_current_active_user)) -> User:
    """Для администраторов или комендантов"""
    if current_user.role.name not in ["admin", "commandant"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: только для администраторов или комендантов"
        )
    return current_user

def admin_or_student_required(current_user: User = Depends(get_current_active_user)) -> User:
    """Для администраторов или студентов"""
    if current_user.role.name not in ["admin", "student"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: только для администраторов или студентов"
        )
    return current_user