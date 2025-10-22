from sqlalchemy.orm import Session
import models, schemas
from security import get_password_hash, verify_password

# CRUD - User
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        nome=user.nome,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
# --- End User CRUD ---

# CRUD - Gerador
def get_gerador(db: Session, gerador_id: int):
    return db.query(models.Gerador).filter(models.Gerador.id == gerador_id).first()

def get_geradores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Gerador).offset(skip).limit(limit).all()

def create_gerador(db: Session, gerador: schemas.GeradorCreate):
    db_gerador = models.Gerador(
        nome=gerador.nome,
        descricao=gerador.descricao 
    )
    db.add(db_gerador)
    db.commit()
    db.refresh(db_gerador)
    return db_gerador

def update_gerador(db: Session, gerador_id: int, gerador_update: schemas.GeradorUpdate):
    db_gerador = get_gerador(db, gerador_id)
    if db_gerador:
        update_data = gerador_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_gerador, key, value)

        db.commit()
        db.refresh(db_gerador)
    return db_gerador

def delete_gerador(db: Session, gerador_id: int):
    db_gerador = get_gerador(db, gerador_id)
    if db_gerador:
        db.delete(db_gerador)
        db.commit()
        return True
    return False
# --- End Gerador CRUD ---

# CRUD - Evento
def get_evento(db: Session, evento_id: int): 
    return db.query(models.Evento).filter(models.Evento.id == evento_id).first()

def get_eventos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Evento).offset(skip).limit(limit).all()

def create_evento(db: Session, evento: schemas.EventoCreate):
    db_gerador = get_gerador(db, evento.id_gerador)
    if not db_gerador:
        return None 
    db_evento = models.Evento(**evento.model_dump())
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento

def update_evento(db: Session, evento_id: int, evento_update: schemas.EventoUpdate):
    db_evento = get_evento(db, evento_id)
    if db_evento:
        if evento_update.id_gerador is not None:
             db_gerador = get_gerador(db, evento_update.id_gerador)
             if not db_gerador:
                 return None 

        update_data = evento_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_evento, key, value)
        db.commit()
        db.refresh(db_evento)
    return db_evento

def delete_evento(db: Session, evento_id: int):
    db_evento = get_evento(db, evento_id)
    if db_evento:
        db.delete(db_evento)
        db.commit()
        return True
    return False
# --- End Evento CRUD ---

# --- Authentication ---
def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
# --- End Authentication ---