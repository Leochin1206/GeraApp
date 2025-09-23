from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "API de Eventos e Geradores está no ar!"}

# Endpoints - Users 
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

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