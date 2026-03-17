from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings  # или свой путь до настроек
from sqlalchemy.orm import declarative_base

Base = declarative_base()

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL  # должен быть URL строки к PostgreSQL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
