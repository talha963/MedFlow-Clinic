import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# We fetch the URL from the environment variable set in docker-compose.yml
# Fallback to localhost if running outside docker for testing
MYSQL_URL = os.getenv("MYSQL_URL", "mysql+pymysql://medflow:medflow123@localhost:3306/medflow")

engine = create_engine(MYSQL_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
