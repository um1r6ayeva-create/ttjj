from app.db.session import SessionLocal
from app.models.role import Role

def init_db():
    """Инициализация базы данных с начальными данными"""
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже роли
        existing_roles = db.query(Role).count()
        
        if existing_roles == 0:
            # Создаем стандартные роли
            roles = [
                Role(name="admin", description="Администратор (староста)"),
                Role(name="commandant", description="Комендант"),
                Role(name="student", description="Студент"),
            ]
            
            db.add_all(roles)
            db.commit()
            print(" Роли успешно созданы")
        else:
            print(" Роли уже существуют")
            
    except Exception as e:
        print(f" Ошибка при инициализации базы данных: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()