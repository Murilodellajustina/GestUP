from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date
from uuid import UUID

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


class UsuarioCadastro(BaseModel):
    nome: str
    telefone: str
    IdadeGestacional: date
    email: EmailStr
    senha: str

class UsuarioResponse(BaseModel):
    id: UUID
    nome: str
    email: str
    telefone: Optional[str] = None
    idadeGestacional: Optional[date] = None

    class Config:
        from_attributes = True


class EventoGestacaoInput(BaseModel):
    titulo: str
    tipo: str = "consulta"
    data: date
    horario: Optional[str] = None
    clinica: Optional[str] = None
    observacoes: Optional[str] = None


class EventoGestacaoResponse(EventoGestacaoInput):
    id: UUID
    realizado: bool

    class Config:
        from_attributes = True
