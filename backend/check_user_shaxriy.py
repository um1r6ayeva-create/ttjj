from sqlalchemy import create_engine, text

database_url = "postgresql+psycopg2://neondb_owner:npg_2bxqMVGFgv7X@ep-morning-flower-adr7i835.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(database_url)

with engine.connect() as conn:
    print("--- Searching for shaxriy ---")
    res = conn.execute(text("SELECT id, name, phone, is_active FROM users WHERE phone = 'shaxriy' OR name LIKE '%Шахризада%'")).fetchall()
    for row in res:
        print(row)
