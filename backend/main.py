# Imports desnecessários (File, UploadFile, Form, Request, StaticFiles, shutil, os) foram removidos
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

# Configuração do CORS (continua igual)
origins = ["http://localhost:8081"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.mount("/uploads", ...) <-- REMOVIDO (não precisamos mais servir fotos)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "API de Eventos e Geradores está no ar!"}

# --- Endpoints de Usuários e Login (continuam iguais) ---
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

# --- Endpoints de Geradores (ATUALIZADOS) ---

# 👇 ALTERADO: Recebe JSON (schemas.GeradorCreate) no corpo da requisição
@app.post("/geradores/", response_model=schemas.Gerador)
def create_gerador(gerador: schemas.GeradorCreate, db: Session = Depends(get_db)):
    # Lógica de salvar foto e prints de debug foram removidos
    try:
        # A função CRUD agora deve receber o schema diretamente (precisaremos ajustar o crud.py)
        return crud.create_gerador(db=db, gerador=gerador)
    except Exception as e:
        # Tratamento de erro genérico
        print(f"!!! ERRO AO CHAMAR CRUD create_gerador: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao criar gerador.")

@app.get("/geradores/", response_model=List[schemas.Gerador])
def read_geradores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_geradores(db, skip=skip, limit=limit)

# 👇 ALTERADO: Recebe JSON (um schema de atualização) no corpo da requisição
@app.put("/geradores/{gerador_id}", response_model=schemas.Gerador)
def update_existing_gerador(
    gerador_id: int,
    gerador_update: schemas.GeradorUpdate, # <-- Usaremos um novo schema para atualização
    db: Session = Depends(get_db)
):
    db_gerador = crud.get_gerador(db, gerador_id)
    if db_gerador is None:
        raise HTTPException(status_code=404, detail="Gerador não encontrado")

    # Lógica de salvar foto foi removida
    try:
        # A função CRUD agora deve receber o schema de atualização (precisaremos ajustar o crud.py)
        return crud.update_gerador(db=db, gerador_id=gerador_id, gerador_update=gerador_update)
    except Exception as e:
        # Tratamento de erro genérico
        print(f"!!! ERRO AO CHAMAR CRUD update_gerador: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao atualizar gerador.")


@app.delete("/geradores/{gerador_id}", status_code=204)
def delete_existing_gerador(gerador_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_gerador(db, gerador_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Gerador não encontrado")
    return {"ok": True} # Ou return Response(status_code=204)

# --- Endpoints de Eventos (continuam iguais por enquanto) ---
@app.post("/eventos/", response_model=schemas.Evento)
def create_evento(evento: schemas.EventoCreate, db: Session = Depends(get_db)):
    db_gerador = crud.get_gerador(db, gerador_id=evento.id_gerador)
    if db_gerador is None:
        raise HTTPException(status_code=404, detail="Gerador não encontrado")
    return crud.create_evento(db=db, evento=evento)

@app.get("/eventos/", response_model=List[schemas.Evento])
def read_eventos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_eventos(db, skip=skip, limit=limit)