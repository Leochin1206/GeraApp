from sqlalchemy.orm import Session
import models, schemas

# CRUD - User 
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(nome=user.nome, foto=user.foto)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# CRUD - Gerador 
def get_gerador(db: Session, gerador_id: int):
    return db.query(models.Gerador).filter(models.Gerador.id == gerador_id).first()

def get_geradores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Gerador).offset(skip).limit(limit).all()

def create_gerador(db: Session, gerador: schemas.GeradorCreate):
    db_gerador = models.Gerador(**gerador.model_dump())
    db.add(db_gerador)
    db.commit()
    db.refresh(db_gerador)
    return db_gerador

# CRUD - Evento 
def get_eventos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Evento).offset(skip).limit(limit).all()

def create_evento(db: Session, evento: schemas.EventoCreate):
    db_evento = models.Evento(**evento.model_dump())
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    return db_evento