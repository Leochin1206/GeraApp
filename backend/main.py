from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import SessionLocal, engine
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import security

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["http://localhost:8081"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    return current_user

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = crud.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=401, detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ===================================== Geradores =====================================

@app.post("/geradores/", response_model=schemas.Gerador)
def create_gerador(gerador: schemas.GeradorCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_gerador(db=db, gerador=gerador)
    except Exception as e:
        print(f"!!! ERRO AO CHAMAR CRUD create_gerador: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar gerador.")

@app.get("/geradores/", response_model=List[schemas.Gerador])
def read_geradores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_geradores(db, skip=skip, limit=limit)

@app.put("/geradores/{gerador_id}", response_model=schemas.Gerador)
def update_existing_gerador(
    gerador_id: int,
    gerador_update: schemas.GeradorUpdate,
    db: Session = Depends(get_db)
):
    db_gerador = crud.get_gerador(db, gerador_id)
    if db_gerador is None:
        raise HTTPException(status_code=404, detail="Gerador não encontrado")

    try:
        return crud.update_gerador(db=db, gerador_id=gerador_id, gerador_update=gerador_update)
    except Exception as e:
        print(f"!!! ERRO AO CHAMAR CRUD update_gerador: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar gerador.")


@app.delete("/geradores/{gerador_id}", status_code=204)
def delete_existing_gerador(gerador_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_gerador(db, gerador_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Gerador não encontrado")
    return {"ok": True} 

# ===================================== Eventos =====================================

@app.post("/eventos/", response_model=schemas.Evento)
def create_evento(evento: schemas.EventoCreate, db: Session = Depends(get_db)):
    db_gerador = crud.get_gerador(db, gerador_id=evento.id_gerador)
    if db_gerador is None:
        raise HTTPException(status_code=404, detail="Gerador não encontrado")
    
    created_evento = crud.create_evento(db=db, evento=evento)
    if created_evento is None: 
         raise HTTPException(status_code=400, detail="Não foi possível criar o evento (verifique o gerador_id).")
    return created_evento

@app.get("/eventos/", response_model=List[schemas.Evento])
def read_eventos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_eventos(db, skip=skip, limit=limit)

@app.put("/eventos/{evento_id}", response_model=schemas.Evento)
def update_existing_evento(
    evento_id: int,
    evento_update: schemas.EventoUpdate,
    db: Session = Depends(get_db)
):
    db_evento = crud.get_evento(db, evento_id)
    if db_evento is None:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    try:
        updated_evento = crud.update_evento(db=db, evento_id=evento_id, evento_update=evento_update)
        if updated_evento is None:
             raise HTTPException(status_code=400, detail="Não foi possível atualizar o evento (verifique o gerador_id).")
        return updated_evento
    except Exception as e:
        print(f"!!! ERRO AO CHAMAR CRUD update_evento: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar evento.")

@app.delete("/eventos/{evento_id}", status_code=204)
def delete_existing_evento(evento_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_evento(db, evento_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return {"ok": True}