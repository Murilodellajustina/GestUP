from datetime import date, datetime
import uuid
from typing import List, Optional
from sqlalchemy import ForeignKey, String, Text, Numeric, Integer, Boolean, DateTime, Date, CheckConstraint, Table, Column, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    telefone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    idadeGestacional: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    # papel da usuária no fórum: "gestante" ou "admin" (moderação).
    # Se um dia entrarem profissionais de saúde, entra um novo valor aqui (ex.: "profissional").
    papel: Mapped[str] = mapped_column(String(20), nullable=False, default="gestante")


class EventoGestacao(Base):
    __tablename__ = "eventos_gestacao"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    titulo: Mapped[str] = mapped_column(String(160), nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False, default="consulta")
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    horario: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    clinica: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    realizado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lembrete_enviado_em: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class TopicoComunidade(Base):
    __tablename__ = "topicos_comunidade"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    titulo: Mapped[str] = mapped_column(String(120), nullable=False)
    mensagem_inicial: Mapped[str] = mapped_column(Text, nullable=False)
    categoria: Mapped[str] = mapped_column(String(30), nullable=False, default="outros")
    anonima: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    autor: Mapped["Usuario"] = relationship()
    mensagens: Mapped[List["MensagemComunidade"]] = relationship(
        back_populates="topico", cascade="all, delete-orphan", order_by="MensagemComunidade.criado_em"
    )
    curtidas: Mapped[List["CurtidaTopico"]] = relationship(
        back_populates="topico", cascade="all, delete-orphan"
    )


class MensagemComunidade(Base):
    __tablename__ = "mensagens_comunidade"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    topico_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("topicos_comunidade.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    texto: Mapped[str] = mapped_column(Text, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    topico: Mapped["TopicoComunidade"] = relationship(back_populates="mensagens")
    autor: Mapped["Usuario"] = relationship()
    curtidas: Mapped[List["CurtidaMensagem"]] = relationship(
        back_populates="mensagem", cascade="all, delete-orphan"
    )


class CurtidaTopico(Base):
    __tablename__ = "curtidas_topicos"
    __table_args__ = (UniqueConstraint("topico_id", "usuario_id", name="uq_curtida_topico"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    topico_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("topicos_comunidade.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    criada_em: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    topico: Mapped["TopicoComunidade"] = relationship(back_populates="curtidas")


class CurtidaMensagem(Base):
    __tablename__ = "curtidas_mensagens"
    __table_args__ = (UniqueConstraint("mensagem_id", "usuario_id", name="uq_curtida_mensagem"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    mensagem_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("mensagens_comunidade.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    criada_em: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    mensagem: Mapped["MensagemComunidade"] = relationship(back_populates="curtidas")


class Denuncia(Base):
    __tablename__ = "denuncias"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tipo: Mapped[str] = mapped_column(String(10), nullable=False)  # "topico" ou "mensagem"
    # SET NULL (e não CASCADE) para manter o histórico da denúncia mesmo depois de o conteúdo ser removido
    topico_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("topicos_comunidade.id", ondelete="SET NULL"), nullable=True, index=True)
    mensagem_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("mensagens_comunidade.id", ondelete="SET NULL"), nullable=True, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    motivo: Mapped[str] = mapped_column(String(30), nullable=False)
    detalhes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(12), nullable=False, default="pendente")
    criada_em: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    resolvida_em: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    denunciante: Mapped["Usuario"] = relationship(foreign_keys=[usuario_id])
    topico: Mapped[Optional["TopicoComunidade"]] = relationship(foreign_keys=[topico_id])
    mensagem: Mapped[Optional["MensagemComunidade"]] = relationship(foreign_keys=[mensagem_id])

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    mensagem: Mapped[str] = mapped_column(Text, nullable=False)
    data_envio: Mapped[date] = mapped_column(Date, default=date.today)

class Configuracao(Base):
    __tablename__ = "configuracoes"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), unique=True)
    modoNoturno: Mapped[bool] = mapped_column(Boolean, default=False)
    textoGrande: Mapped[bool] = mapped_column(Boolean, default=False)
    notificacoesPush: Mapped[bool] = mapped_column(Boolean, default=True)
    lembretesEmail: Mapped[bool] = mapped_column(Boolean, default=False)
