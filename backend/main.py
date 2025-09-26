from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, models, schemas
from database import SessionLocal, engine
import shutil
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:8081",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "API de Eventos e Geradores está no ar!"}

@app.post("/users/", response_model=schemas.User)
def create_user(
    db: Session = Depends(get_db),
    nome: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    foto: Optional[UploadFile] = File(None)
):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    foto_path = None
    if foto:
        foto_path = f"uploads/{foto.filename}"
        os.makedirs(os.path.dirname(foto_path), exist_ok=True)
        with open(foto_path, "wb") as buffer:
            shutil.copyfileobj(foto.file, buffer)

    user_schema = schemas.UserCreate(
        nome=nome,
        email=email,
        password=password,
        foto=foto_path 
    )

    return crud.create_user(db=db, user=user_schema)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

# Endpoints - Geradores 
@app.post("/geradores/", response_model=schemas.Gerador)
def create_gerador(gerador: schemas.GeradorCreate, db: Session = Depends(get_db)):
    return crud.create_gerador(db=db, gerador=gerador)

@app.get("/geradores/", response_model=List[schemas.Gerador])
def read_geradores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_geradores(db, skip=skip, limit=limit)

# Endpoints - Eventos 
@app.post("/eventos/", response_model=schemas.Evento)
def create_evento(evento: schemas.EventoCreate, db: Session = Depends(get_db)):
    db_gerador = crud.get_gerador(db, gerador_id=evento.id_gerador)
    if db_gerador is None:
        raise HTTPException(status_code=404, detail="Gerador não encontrado")
    return crud.create_evento(db=db, evento=evento)

@app.get("/eventos/", response_model=List[schemas.Evento])
def read_eventos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_eventos(db, skip=skip, limit=limit)