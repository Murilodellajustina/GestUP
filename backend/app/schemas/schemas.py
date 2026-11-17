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
    papel: str = "gestante"

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


# Categorias e motivos aceitos no fórum (validados nas rotas, no estilo de "consulta"/"exame")
CATEGORIAS_FORUM = {
    "1º trimestre", "2º trimestre", "3º trimestre",
    "pós-parto", "alimentação", "emocional", "outros",
}
MOTIVOS_DENUNCIA = {
    "conteúdo ofensivo", "desinformação",
    "assédio ou constrangimento", "spam", "outro",
}


class TopicoComunidadeCreate(BaseModel):
    titulo: str = Field(min_length=4, max_length=120)
    mensagem: str = Field(min_length=2, max_length=4000)
    categoria: str = "outros"
    anonima: bool = False


class TopicoComunidadeUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=4, max_length=120)
    mensagem: Optional[str] = Field(default=None, min_length=2, max_length=4000)
    categoria: Optional[str] = None


class MensagemComunidadeCreate(BaseModel):
    texto: str = Field(min_length=1, max_length=2000)


class MensagemComunidadeUpdate(BaseModel):
    texto: Optional[str] = Field(default=None, min_length=1, max_length=2000)


class MensagemComunidadeResponse(BaseModel):
    id: UUID
    texto: str
    autor: str
    criado_em: datetime
    sou_autor: bool = False
    curtidas: int = 0
    curtiu: bool = False


class TopicoComunidadeResponse(BaseModel):
    id: UUID
    titulo: str
    mensagem_inicial: str
    categoria: str
    anonima: bool
    autor: str
    autor_real: Optional[str] = None  # preenchido só para moderação ver quem postou como anônima
    criado_em: datetime
    sou_autor: bool = False
    curtidas: int = 0
    curtiu: bool = False
    mensagens: list[MensagemComunidadeResponse] = Field(default_factory=list)


class DenunciaCreate(BaseModel):
    tipo: str  # "topico" ou "mensagem"
    conteudo_id: UUID
    motivo: str
    detalhes: Optional[str] = Field(default=None, max_length=500)


class DenunciaResolucao(BaseModel):
    acao: str  # "ignorar" ou "remover"


class DenunciaResponse(BaseModel):
    id: UUID
    tipo: str
    motivo: str
    detalhes: Optional[str] = None
    status: str
    criada_em: datetime
    resolvida_em: Optional[datetime] = None
    denunciante: str
    conteudo: str  # prévia do conteúdo denunciado (título ou texto)
    autor_conteudo: str  # nome real de quem postou (visível só para moderação)
    topico_id: Optional[UUID] = None
    mensagem_id: Optional[UUID] = None
