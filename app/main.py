from fastapi import FastAPI
from app.database.connection import engine
from app.database.models import Base
from app.api import auth

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Backend + Auth Running"}