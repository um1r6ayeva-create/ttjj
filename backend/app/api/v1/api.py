# backend/app/api/v1/api.py
from fastapi import APIRouter
from .users import router as users_router
from app.api import duties, duty_reports  # Импортируем duty_reports!
# Уберите student_duties если он больше не нужен
from .duties import commandant as commandant_router
from .endpoints.applications import router as applications_router  # ИЗМЕНИЛ ИМПОРТ
from app.routers.global_duty import router as global_duties_router 
from app.routers.news import router as news 
from app.api import translate 
router = APIRouter()

# Подключаем роутеры
router.include_router(users_router, prefix="/users", tags=["Users"])
router.include_router(duties.router, prefix="/duties", tags=["Duties"])
router.include_router(duty_reports.router, prefix="/duty-reports", tags=["Duty Reports"])  # ДОБАВЬТЕ ЭТО!
router.include_router(global_duties_router, tags=["Global Duties"])
router.include_router(applications_router, prefix="/applications", tags=["Applications"])
router.include_router(news, tags=["News"])

router.include_router(translate.router, tags=["Translate"])
__all__ = ["router"]