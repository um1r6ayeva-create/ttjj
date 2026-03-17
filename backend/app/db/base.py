# app/db/base.py
from app.models import user, product, order  # обязательно импортировать
from app.db.session import engine
from sqlalchemy.orm import declarative_base
from app.models import  wishlist

Base = declarative_base()

def create_all():
    Base.metadata.create_all(bind=engine)
