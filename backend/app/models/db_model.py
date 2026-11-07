from datetime import date, datetime
import uuid
from typing import List, Optional
from sqlalchemy import ForeignKey, String, Text, Numeric, Integer, Boolean, DateTime, Date, CheckConstraint, Table, Column
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
