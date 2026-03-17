# app/api/__init__.py
from .duties import router as duties_router
from .duty_reports import router as duty_reports_router

# Если нужно, экспортируйте
__all__ = ["duties_router", "duty_reports_router"]