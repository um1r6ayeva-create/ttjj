from app.db.database import engine
from app.db.base import Base
import app.models  # ensure models are loaded

Base.metadata.create_all(bind=engine)
