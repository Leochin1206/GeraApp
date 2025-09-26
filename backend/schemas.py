from pydantic import BaseModel, EmailStr 
from datetime import date

# Schemas - Gerador 
class GeradorBase(BaseModel):
    nome: str
    foto: str | None = None

class GeradorCreate(GeradorBase):
    pass

class Gerador(GeradorBase):
    id: int
    eventos: list['Evento'] = [] 

    class Config:
        orm_mode = True

# Schemas - Evento 
class EventoBase(BaseModel):
    local: str
    descricao: str
    data: date
    operador: str
    responsavel: str
    fone_resp: str | None = None
    id_gerador: int

class EventoCreate(EventoBase):
    pass

class Evento(EventoBase):
    id: int
    gerador: Gerador 

    class Config:
        orm_mode = True

# Schemas - User 
class UserBase(BaseModel):
    nome: str
    email: EmailStr
    foto: str | None = None

class UserCreate(UserBase):
    password: str 

class User(UserBase):
    id: int

    class Config:
        from_attributes = True