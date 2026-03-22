from sqlalchemy import create_engine, inspect

database_url = "postgresql+psycopg2://neondb_owner:npg_2bxqMVGFgv7X@ep-morning-flower-adr7i835.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(database_url)

inspector = inspect(engine)
columns = inspector.get_columns('users')

print("--- Users Table Schema ---")
for col in columns:
    print(f"Name: {col['name']} | Type: {col['type']} | Nullable: {col['nullable']}")
