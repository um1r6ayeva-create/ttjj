# backend/app/api/v1/users/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.token import Token
from app.core.security import hash_password, verify_password
from app.core.jwt import create_user_token

router = APIRouter()


@router.post("/login", response_model=Token)
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Вход в систему по phone и паролю
    """
    user = db.query(User).filter(User.phone == user_data.phone).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный телефон или пароль"
        )
    
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный телефон или пароль"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Аккаунт деактивирован"
        )
    
    access_token = create_user_token(user.phone)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role.name
    )


@router.post("/register", response_model=UserResponse)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Регистрация нового пользователя
    """
    # Проверка существования пользователя с таким phone
    existing_phone = db.query(User).filter(User.phone == user_data.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким телефоном уже существует"
        )
    
    # Проверка email если указан
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует"
            )
    
    # Проверка существования роли
    role = db.query(Role).filter(Role.id == user_data.role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Указанная роль не существует"
        )
    
    # Проверка для студента и старосты (admin)
    if role.name in ['student', 'admin']:
        if not user_data.user_group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Для студента и старосты обязательно указать группу"
            )
        if not user_data.n_room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Для студента и старосты обязательно указать номер комнаты"
            )
    
    # Создание пользователя
    user = User(
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        name=user_data.name,
        surname=user_data.surname,
        email=user_data.email,
        user_group=user_data.user_group,
        n_room=user_data.n_room,
        role_id=user_data.role_id,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        phone=user.phone,
        name=user.name,
        surname=user.surname,
        email=user.email,
        user_group=user.user_group,
        n_room=user.n_room,
        role=role.name,
        is_active=user.is_active
    )