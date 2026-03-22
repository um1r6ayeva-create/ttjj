from app.db.session import SessionLocal
from app.models.user import User

db = SessionLocal()
try:
    users = db.query(User).all()
    print("--- Database Users ---")
    for u in users:
        print(f"ID: {u.id} | Name: {u.name} | Phone/Login: {u.phone} | Active: {u.is_active} | RoleID: {u.role_id}")
finally:
    db.close()
