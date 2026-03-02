from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database.connection import engine, get_db
from app.database.models import Base

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Backend + Database Connected"}

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    return {"status": "Database session working"}