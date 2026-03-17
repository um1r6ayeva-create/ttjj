from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from datetime import datetime
from typing import Optional, List, Tuple

from app.models.duty import Duty
from app.models.duty_report import DutyReport
from app.schemas.duty import DutyCreate, DutyUpdate

# --- Статусы дежурств ---
VALID_STATUSES = [
    "pending",          # назначено, ожидает выполнения
    "submitted",        # отчёт отправлен, ожидает проверки
    "confirmed",        # подтверждено командантом
    "rejected",         # отклонено командантом
    "expired",          # просрочено
]

def create_duty(db: Session, duty_in: DutyCreate, assigned_by_id: int) -> Duty:
    """
    Создать новое дежурство для комнаты.
    """
    duty = Duty(
        duty_type=duty_in.duty_type,
        room_number=duty_in.room_number,
        floor=duty_in.floor,
        date_due=duty_in.date_due,
        date_assigned=datetime.utcnow(),
        status="pending",  # начальный статус
        assigned_by_id=assigned_by_id,
        notes=duty_in.notes,
    )

    db.add(duty)
    db.commit()
    db.refresh(duty)
    return duty


def get_duty(db: Session, duty_id: int) -> Optional[Duty]:
    """
    Получить дежурство по ID с информацией о назначившем.
    """
    return db.query(Duty).options(joinedload(Duty.assigned_by)).filter(Duty.id == duty_id).first()


def get_duties(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    room_number: Optional[int] = None,
    floor: Optional[int] = None,
    status: Optional[str] = None,
    duty_type: Optional[str] = None,
    sort_by: str = "date_due",
    sort_order: str = "asc"
) -> List[Duty]:
    """
    Получить список дежурств с фильтрацией и сортировкой.
    """
    query = db.query(Duty).options(joinedload(Duty.assigned_by))
    
    # Применяем фильтры
    if room_number is not None:
        query = query.filter(Duty.room_number == room_number)
    if floor is not None:
        query = query.filter(Duty.floor == floor)
    if status is not None:
        query = query.filter(Duty.status == status)
    if duty_type is not None:
        query = query.filter(Duty.duty_type == duty_type)
    
    # Применяем сортировку
    sort_column = getattr(Duty, sort_by, Duty.date_due)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)
    
    return query.offset(skip).limit(limit).all()


def update_duty(db: Session, duty_id: int, duty_in: DutyUpdate) -> Optional[Duty]:
    """
    Обновить информацию о дежурстве.
    """
    duty = db.query(Duty).filter(Duty.id == duty_id).first()
    if not duty:
        return None

    data = duty_in.model_dump(exclude_unset=True)
    
    # Проверяем валидность статуса
    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            raise ValueError(f"Некорректный статус. Допустимые значения: {', '.join(VALID_STATUSES)}")
        
        # Проверяем, можно ли установить статус
        new_status = data["status"]
        
        # Если пытаемся установить submitted - проверяем наличие отчета
        if new_status == "submitted":
            report_exists = db.query(DutyReport).filter(
                DutyReport.duty_id == duty_id
            ).first()
            if not report_exists:
                raise ValueError("Нельзя установить статус 'submitted' без отчета")
        
        # Если пытаемся установить confirmed/rejected - проверяем наличие отчета
        elif new_status in ["confirmed", "rejected"]:
            report_exists = db.query(DutyReport).filter(
                DutyReport.duty_id == duty_id
            ).first()
            if not report_exists:
                raise ValueError(f"Нельзя установить статус '{new_status}' без отчета")
            
            # Также проверяем, что отчет имеет статус "waiting"
            report = db.query(DutyReport).filter(
                DutyReport.duty_id == duty_id,
                DutyReport.status == "waiting"
            ).first()
            if not report:
                raise ValueError(f"Для установки статуса '{new_status}' нужен отчет со статусом 'waiting'")
    
    # Обновляем поля
    for key, value in data.items():
        setattr(duty, key, value)
    
    duty.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(duty)
    return duty


def delete_duty(db: Session, duty_id: int) -> bool:
    """
    Удалить дежурство.
    """
    duty = db.query(Duty).filter(Duty.id == duty_id).first()
    if not duty:
        return False

    # Удаляем все связанные отчеты (если каскадное удаление не настроено в модели)
    db.query(DutyReport).filter(DutyReport.duty_id == duty_id).delete()
    
    db.delete(duty)
    db.commit()
    return True


def get_duties_by_room(db: Session, room_number: int) -> List[Duty]:
    """
    Получить все дежурства для указанной комнаты.
    """
    return db.query(Duty).options(joinedload(Duty.assigned_by)).filter(
        Duty.room_number == room_number
    ).order_by(Duty.date_due).all()


def get_duties_by_floor(db: Session, floor: int) -> List[Duty]:
    """
    Получить все дежурства для указанного этажа.
    """
    return db.query(Duty).options(joinedload(Duty.assigned_by)).filter(
        Duty.floor == floor
    ).order_by(Duty.room_number, Duty.date_due).all()


def get_pending_duties(db: Session, skip: int = 0, limit: int = 100) -> List[Duty]:
    """
    Получить дежурства со статусом 'pending' (ожидают выполнения).
    """
    return db.query(Duty).options(joinedload(Duty.assigned_by)).filter(
        Duty.status == "pending"
    ).order_by(Duty.date_due).offset(skip).limit(limit).all()


def get_duties_with_reports(db: Session, skip: int = 0, limit: int = 100) -> List[Tuple[Duty, DutyReport]]:
    """
    Получить дежурства с отчетами для проверки.
    """
    duties_with_reports = db.query(Duty, DutyReport).join(
        DutyReport, Duty.id == DutyReport.duty_id
    ).filter(
        DutyReport.status == "waiting"  # отчеты, ожидающие проверки
    ).order_by(
        DutyReport.submitted_at
    ).offset(skip).limit(limit).all()
    
    return duties_with_reports


def get_duty_with_reports(db: Session, duty_id: int) -> Optional[Tuple[Duty, List[DutyReport]]]:
    """
    Получить дежурство со всеми отчетами.
    """
    duty = db.query(Duty).options(joinedload(Duty.assigned_by)).filter(Duty.id == duty_id).first()
    if not duty:
        return None
    
    reports = db.query(DutyReport).filter(DutyReport.duty_id == duty_id).all()
    
    return duty, reports


def update_duty_status(db: Session, duty_id: int, new_status: str, require_report: bool = True) -> Optional[Duty]:
    """
    Обновить статус дежурства с проверками.
    """
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Некорректный статус. Допустимые значения: {', '.join(VALID_STATUSES)}")
    
    duty = db.query(Duty).filter(Duty.id == duty_id).first()
    if not duty:
        return None
    
    # Проверяем наличие отчета при необходимости
    if require_report and new_status in ["submitted", "confirmed", "rejected"]:
        report_exists = db.query(DutyReport).filter(DutyReport.duty_id == duty_id).first()
        if not report_exists:
            raise ValueError(f"Для установки статуса '{new_status}' нужен как минимум один отчет")
    
    # Проверяем статус отчетов для confirmed/rejected
    if new_status in ["confirmed", "rejected"]:
        waiting_report = db.query(DutyReport).filter(
            DutyReport.duty_id == duty_id,
            DutyReport.status == "waiting"
        ).first()
        if not waiting_report:
            raise ValueError(f"Для установки статуса '{new_status}' нужен отчет со статусом 'waiting'")
    
    # Обновляем статус
    duty.status = new_status
    duty.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(duty)
    
    return duty


def check_and_update_expired_duties(db: Session) -> int:
    """
    Проверить и обновить статус просроченных дежурств.
    Возвращает количество обновленных дежурств.
    """
    now = datetime.utcnow()
    
    # Находим дежурства с истекшим сроком, которые еще в статусе pending
    expired_duties = db.query(Duty).filter(
        Duty.date_due < now,
        Duty.status == "pending"
    ).all()
    
    updated_count = 0
    for duty in expired_duties:
        duty.status = "expired"
        duty.updated_at = now
        updated_count += 1
    
    if updated_count > 0:
        db.commit()
    
    return updated_count


def get_duties_statistics(db: Session) -> dict:
    """
    Получить статистику по дежурствам.
    """
    total = db.query(Duty).count()
    
    status_counts = {}
    for status in VALID_STATUSES:
        count = db.query(Duty).filter(Duty.status == status).count()
        status_counts[status] = count
    
    # Статистика по типам дежурств
    kitchen_count = db.query(Duty).filter(Duty.duty_type == "kitchen").count()
    shower_count = db.query(Duty).filter(Duty.duty_type == "shower").count()
    
    # Дежурства на сегодня/завтра
    today = datetime.utcnow().date()
    tomorrow = datetime(today.year, today.month, today.day + 1).date()
    
    today_duties = db.query(Duty).filter(
        Duty.date_due >= datetime(today.year, today.month, today.day),
        Duty.date_due < datetime(tomorrow.year, tomorrow.month, tomorrow.day)
    ).count()
    
    return {
        "total": total,
        "by_status": status_counts,
        "by_type": {
            "kitchen": kitchen_count,
            "shower": shower_count,
        },
        "today": today_duties,
    }


def search_duties(
    db: Session,
    query: str,
    skip: int = 0,
    limit: int = 100
) -> List[Duty]:
    """
    Поиск дежурств по номеру комнаты или заметкам.
    """
    # Пытаемся преобразовать запрос в число для поиска по номеру комнаты
    try:
        room_number = int(query)
        return db.query(Duty).filter(Duty.room_number == room_number).offset(skip).limit(limit).all()
    except ValueError:
        # Если не число, ищем в заметках
        return db.query(Duty).filter(Duty.notes.ilike(f"%{query}%")).offset(skip).limit(limit).all()