from sqlalchemy import create_engine, text
import os

database_url = "postgresql+psycopg2://neondb_owner:npg_2bxqMVGFgv7X@ep-morning-flower-adr7i835.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(database_url)

with engine.connect() as conn:
    print("Dumping users table...")
    res = conn.execute(text("SELECT id, name, phone, is_active, role_id FROM users")).fetchall()
    with open("users_dump.txt", "w", encoding="utf-8") as f:
        f.write("id | name | phone | is_active | role_id\n")
        f.write("-" * 50 + "\n")
        for row in res:
            f.write(f"{row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]}\n")
    print("Dump completed to users_dump.txt")
