# backend/app/api/v1/users/router.py
from fastapi import APIRouter
from . import auth, profile,commandant

router = APIRouter()

# Подключаем все модули
router.include_router(auth.router, tags=["users-auth"])
router.include_router(profile.router, tags=["users-profile"])

router.include_router(commandant.router, tags=["users-commandant"])