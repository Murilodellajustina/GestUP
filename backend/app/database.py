from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

#substituir pela senha do postgre
SQLALCHEMY_DATABASE_URL = "postgresql://neondb_owner:npg_9NutIx0EohWH@ep-autumn-surf-bcqezq4s-pooler.c-16.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()