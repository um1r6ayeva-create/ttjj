import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.api import router as api_v1_router
from app.db.session import engine
from app.db.base_class import Base
from app.db.init_db import init_db

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

# Теперь можно создавать таблицы
Base.metadata.create_all(bind=engine)

# Инициализируем начальные данные (если нужно)
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- CORS middleware должно идти до include_router ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOADS_DIR),
    name="uploads"
)

# Подключаем роутеры
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}