from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.application import Application
from app.schemas.application import ApplicationCreate

def create_application(
    db: Session,
    application: ApplicationCreate,
    file_path: str,
    file_name: str
) -> Application:
    db_application = Application(
        user_id=application.user_id,
        name=application.name,
        surname=application.surname,
        n_room=application.n_room,
        phone=application.phone,
        type=application.type,
        file_path=file_path,
        file_name=file_name,
        status="sent"
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_application(db: Session, application_id: int) -> Optional[Application]:
    return db.query(Application).filter(Application.id == application_id).first()

def get_applications_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Application]:
    return db.query(Application)\
             .filter(Application.user_id == user_id)\
             .order_by(Application.created_at.desc())\
             .offset(skip).limit(limit).all()

def get_all_applications(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[Application]:
    return db.query(Application)\
             .order_by(Application.created_at.desc())\
             .offset(skip).limit(limit).all()

def update_application_status(
    db: Session,
    application_id: int,
    status: str
) -> Optional[Application]:
    db_application = get_application(db, application_id)
    if db_application:
        db_application.status = status
        db_application.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_application)
    return db_application

def delete_application(db: Session, application_id: int) -> Optional[Application]:
    db_application = get_application(db, application_id)
    if db_application:
        db.delete(db_application)
        db.commit()
    return db_application