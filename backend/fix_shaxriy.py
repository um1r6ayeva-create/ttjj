from passlib.context import CryptContext
from sqlalchemy import create_engine, text

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
database_url = "postgresql+psycopg2://neondb_owner:npg_2bxqMVGFgv7X@ep-morning-flower-adr7i835.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(database_url)

hashed_pwd = pwd_context.hash("password")

with engine.connect() as conn:
    print("--- Fixing user shaxriy ---")
    # 1. Найти пользователя по логину или по имени
    res = conn.execute(text("SELECT id, name, phone FROM users WHERE phone = 'shaxriy' OR name LIKE '%Шахризада%'")).fetchall()
    
    if not res:
        print("Пользователь не найден!")
    else:
        for row in res:
            user_id = row[0]
            print(f"Found user: {row[1]} (ID: {user_id}, Current Login: {row[2]})")
            
            # 2. Обновить пароль, логин и статус
            conn.execute(text("""
                UPDATE users 
                SET phone = 'shaxriy', 
                    password_hash = :hp, 
                    is_active = true 
                WHERE id = :uid
            """), {"hp": hashed_pwd, "uid": user_id})
            print(f"User {row[1]} updated: Login='shaxriy', Password='password', Active=True")
            
    conn.commit()
