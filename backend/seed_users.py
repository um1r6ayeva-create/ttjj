from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.security import hash_password
from app.models.role import Role

engine = create_engine('postgresql://neondb_owner:npg_2bxqMVGFgv7X@ep-morning-flower-adr7i835-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require')
SessionLocal = sessionmaker(bind=engine)

def seed_users():
    db = SessionLocal()
    try:
        # 1. Commandant (ID 3)
        cmd = db.query(User).filter(User.phone == "+998901234567").first()
        if not cmd:
            cmd = User(
                name="Комендант",
                surname="Тестовый",
                phone="+998901234567",
                email="commandant@example.com",
                password_hash=hash_password("password"),
                role_id=2, # Commandant
                is_active=True
            )
            db.add(cmd)
            
        # 2. Starosta (ID 1)
        adm = db.query(User).filter(User.phone == "+998998901234").first()
        if not adm:
            adm = User(
                name="Староста",
                surname="Тестовый",
                phone="+998998901234",
                email="admin@example.com",
                user_group="123-22",
                n_room=201,
                floor=3,
                password_hash=hash_password("password"),
                role_id=1, # Admin/Starosta
                is_active=True
            )
            db.add(adm)

        db.commit()
        print("Default users created successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
