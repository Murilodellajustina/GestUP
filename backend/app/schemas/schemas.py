from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
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

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    idadeGestacional: Optional[date] = None

class FeedbackCreate(BaseModel):
    mensagem: str

class ConfiguracaoSchema(BaseModel):
    modoNoturno: bool
    textoGrande: bool
    notificacoesPush: bool
    lembretesEmail: bool


class TopicoComunidadeCreate(BaseModel):
    titulo: str = Field(min_length=4, max_length=120)
    mensagem: str = Field(min_length=2, max_length=4000)


class MensagemComunidadeCreate(BaseModel):
    texto: str = Field(min_length=1, max_length=2000)


class MensagemComunidadeResponse(BaseModel):
    id: UUID
    texto: str
    autor: str
    criado_em: datetime


class TopicoComunidadeResponse(BaseModel):
    id: UUID
    titulo: str
    mensagem_inicial: str
    autor: str
    criado_em: datetime
    mensagens: list[MensagemComunidadeResponse] = Field(default_factory=list)
