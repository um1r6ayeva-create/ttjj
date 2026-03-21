# backend/app/api/v1/api.py
from fastapi import APIRouter
from .users.router import router as users_router
from app.api.duties import router as duties_module_router
from app.api.duty_reports import router as duty_reports_module_router
from .duties.commandant import router as commandant_router
from .endpoints.applications import router as applications_router
from app.routers.global_duty import router as global_duties_router 
from app.routers.news import router as news_router
from app.api.translate import router as translate_router

router = APIRouter()

# Подключаем роутеры
router.include_router(users_router, prefix="/users", tags=["Users"])
router.include_router(duties_module_router, prefix="/duties", tags=["Duties"])
router.include_router(duty_reports_module_router, prefix="/duty-reports", tags=["Duty Reports"])
router.include_router(global_duties_router, tags=["Global Duties"])
router.include_router(applications_router, prefix="/applications", tags=["Applications"])
router.include_router(commandant_router, prefix="/duties/commandant", tags=["Commandant Duties"])
router.include_router(news_router, tags=["News"])
router.include_router(translate_router, tags=["Translate"])

__all__ = ["router"]