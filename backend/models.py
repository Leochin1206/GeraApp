from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    foto = Column(Text) 

class Gerador(Base):
    __tablename__ = "gerador"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    foto = Column(Text)
    eventos = relationship("Evento", back_populates="gerador")

class Evento(Base):
    __tablename__ = "evento"

    id = Column(Integer, primary_key=True, index=True)
    local = Column(String)
    descricao = Column(Text)
    data = Column(Date)
    operador = Column(String)
    responsavel = Column(String)
    fone_resp = Column(String)
    id_gerador = Column(Integer, ForeignKey("gerador.id"))
    gerador = relationship("Gerador", back_populates="eventos")