import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv

# Загружаем .env из корня backend
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

# Используем DATABASE_URL напрямую (поддержка Neon и локальной БД)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:123456@localhost:5432/ttj"
)

# Создаём движок SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Создаём сессию
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Общая база для всех моделей
Base = declarative_base()

# Зависимость для FastAPI
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
