from fastapi import FastAPI, Depends
from app.database.connection import engine
from app.database.models import Base
from app.api import auth
from app.core.auth_dependency import get_current_user

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Backend + Auth Running"}

@app.get("/protected")
def protected_route(current_user = Depends(get_current_user)):
    return {"message": f"Hello {current_user.email}"}