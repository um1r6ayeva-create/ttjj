from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("Ошибка: DATABASE_URL не найден в .env")
    exit()

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)

try:
    engine = create_engine(db_url)
    with engine.begin() as conn: # Использование .begin() для автокоммита
        print("Подключение к базе данных успешно! Начинаю обновление логинов...")
        
        result1 = conn.execute(text("""
            UPDATE users 
            SET phone = 'commandant' 
            WHERE role_id = (SELECT id FROM roles WHERE name = 'commandant')
        """))
        
        result2 = conn.execute(text("""
            UPDATE users 
            SET phone = 'starosta' 
            WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')
        """))
        
        print("\nГотово! Логины успешно изменены на 'commandant' и 'starosta'.")
        print(f"Обновлено комендантов: {result1.rowcount}")
        print(f"Обновлено старост: {result2.rowcount}")
        print("\nТеперь вы можете заходить на сайт с паролем 'password'!")
except Exception as e:
    print(f"Произошла ошибка: {e}")
