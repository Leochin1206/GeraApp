from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional 

# Schemas - Gerador
class GeradorBase(BaseModel):
    nome: str
    descricao: str | None = None 

class GeradorCreate(GeradorBase):
    pass

class GeradorUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None

class Gerador(GeradorBase): 
    id: int

    class Config:
        from_attributes = True

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

class EventoUpdate(BaseModel):
    local: Optional[str] = None
    descricao: Optional[str] = None
    data: Optional[date] = None
    operador: Optional[str] = None
    responsavel: Optional[str] = None
    fone_resp: Optional[str] = None
    id_gerador: Optional[int] = None

class Evento(EventoBase):
    class Config:
        from_attributes = True

# Schemas - User
class UserBase(BaseModel):
    nome: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Schemas - Token (remain the same)
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None