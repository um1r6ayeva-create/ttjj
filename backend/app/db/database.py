import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv

# Загружаем .env из корня проекта
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

# Получаем параметры из .env
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ttj")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "123456")

# Собираем строку подключения
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Создаём движок SQLAlchemy
engine = create_engine(DATABASE_URL)

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
