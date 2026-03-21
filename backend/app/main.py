import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import traceback

from app.core.config import settings
from app.api.v1.api import router as api_v1_router
from app.db.session import engine
from app.db.base_class import Base
from app.db.init_db import init_db

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# --- Настройка Базы Данных ---
try:
    print("--- STARTING DATABASE INITIALIZATION ---")
    # Теперь можно создавать таблицы
    Base.metadata.create_all(bind=engine)
    print("--- DATABASE TABLES CREATED ---")
    
    # Инициализируем начальные данные (если нужно)
    init_db()
    print("--- DATABASE INITIALIZED SUCCESSFULLY ---")
except Exception as e:
    print(f"!!! CRITICAL STARTUP ERROR: {e} !!!")
    traceback.print_exc()
    # Мы не будем вызывать exit(), чтобы uvicorn успел вывести логи в консоль Render

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print(f"--- GLOBAL ERROR CAUGHT: {e} ---")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "traceback": traceback.format_exc()}
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