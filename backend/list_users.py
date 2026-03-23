from sqlalchemy import create_engine, text

database_url = "postgresql+psycopg2://neondb_owner:npg_2bxqMVGFgv7X@ep-morning-flower-adr7i835.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(database_url)

with engine.connect() as conn:
    print("Listing all users...")
    query = text("""
        SELECT u.id, u.name, u.surname, u.phone, r.name as role 
        FROM users u 
        JOIN roles r ON u.role_id = r.id
    """)
    users = conn.execute(query).fetchall()
    for row in users:
        print(f"ID: {row[0]} | Name: '{row[1]} {row[2]}' | Phone/Login: {row[3]} | Role: {row[4]}")
