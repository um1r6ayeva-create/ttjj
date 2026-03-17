from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # База данных
    DATABASE_URL: str
    # API ключ DeepSeek
    DEEPSEEK_API_KEY: str  # <- обязательная аннотация типа
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ttjj.vercel.app",
        "https://ttjj-*.vercel.app",
    ]  # обязательно список фронтендов

    # Настройки приложения
    APP_NAME: str = "TTJ Hostel Management"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

settings = Settings()
