import os
import sys

# Добавляем корень проекта в путь
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.db.database import engine
from sqlalchemy import inspect

def check_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Существующие таблицы:", tables)
    
    new_tables = ["global_duties", "global_duty_reports", "global_report_photos"]
    for table in new_tables:
        if table in tables:
            print(f"[OK] Таблица {table} существует")
        else:
            print(f"[ERROR] Таблица {table} ОТСУТСТВУЕТ")

if __name__ == "__main__":
    check_tables()
