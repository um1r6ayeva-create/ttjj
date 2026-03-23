from sqlalchemy import create_engine, text

database_url = "postgresql+psycopg2://neondb_owner:npg_2bxqMVGFgv7X@ep-morning-flower-adr7i835.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(database_url)

with engine.connect() as conn:
    print("Updating commandant name...")
    # Find the role_id for commandant
    role_res = conn.execute(text("SELECT id FROM roles WHERE name = 'commandant'")).fetchone()
    if role_res:
        role_id = role_res[0]
        # Update user name and surname
        result = conn.execute(
            text("UPDATE users SET name = 'Комендант', surname = '' WHERE role_id = :rid"),
            {"rid": role_id}
        )
        conn.commit()
        print(f"Updated {result.rowcount} user(s).")
    else:
        print("Role 'commandant' not found.")
