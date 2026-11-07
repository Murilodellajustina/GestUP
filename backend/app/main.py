from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.db_model import Base
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.db_model import Usuario
from app.schemas.schemas import UsuarioCadastro
from app.services.security import gerar_hash
from app.schemas.schemas import UsuarioLogin, UsuarioResponse
from app.services.security import verificar_senha, get_current_user, criar_token_acesso
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
import os
import uuid
from uuid import UUID
from datetime import date, datetime, timedelta
from contextlib import asynccontextmanager
import asyncio
import logging
import smtplib
from email.message import EmailMessage
from zoneinfo import ZoneInfo
from app.models.db_model import EventoGestacao
from app.schemas.schemas import EventoGestacaoInput, EventoGestacaoResponse
from app.models.db_model import Feedback, Configuracao
from app.schemas.schemas import UsuarioUpdate, FeedbackCreate, ConfiguracaoSchema

logger = logging.getLogger(__name__)


def enviar_lembretes_pendentes():
    host = os.getenv("SMTP_HOST")
    remetente = os.getenv("SMTP_FROM") or os.getenv("SMTP_USER")
    if not host or not remetente:
        return
    db = next(get_db())
    try:
        hoje = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
        limite = hoje + timedelta(days=7)
        eventos = db.query(EventoGestacao).join(Usuario).filter(
            EventoGestacao.realizado.is_(False),
            EventoGestacao.lembrete_enviado_em.is_(None),
            EventoGestacao.data >= hoje,
            EventoGestacao.data < limite,
        ).all()
        for evento in eventos:
            usuario = db.query(Usuario).filter(Usuario.id == evento.usuario_id).first()
            if not usuario:
                continue
            mensagem = EmailMessage()
            mensagem["Subject"] = f"Lembrete: {evento.titulo} está chegando"
            mensagem["From"] = remetente
            mensagem["To"] = usuario.email
            quando = evento.data.strftime("%d/%m/%Y")
            horario = f" às {evento.horario}" if evento.horario else ""
            mensagem.set_content(
                f"Olá, {usuario.nome}!\n\nVocê tem {evento.tipo} agendado para {quando}{horario}.\n"
                f"Local: {evento.clinica or 'não informado'}.\n\n"
                "Acesse o GestUp para ver os detalhes."
            )
            try:
                porta = int(os.getenv("SMTP_PORT", "587"))
                with smtplib.SMTP(host, porta, timeout=20) as servidor:
                    servidor.starttls()
                    usuario_smtp = os.getenv("SMTP_USER")
                    senha_smtp = os.getenv("SMTP_PASSWORD")
                    if usuario_smtp and senha_smtp:
                        servidor.login(usuario_smtp, senha_smtp)
                    servidor.send_message(mensagem)
                evento.lembrete_enviado_em = datetime.now(ZoneInfo("America/Sao_Paulo")).replace(tzinfo=None)
                db.commit()
            except Exception:
                db.rollback()
                logger.exception("Falha ao enviar lembrete do evento %s", evento.id)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    async def rotina_lembretes():
        while True:
            await asyncio.to_thread(enviar_lembretes_pendentes)
            await asyncio.sleep(60 * 60)

    tarefa = asyncio.create_task(rotina_lembretes())
    yield
    tarefa.cancel()
    try:
        await tarefa
    except asyncio.CancelledError:
        pass

Base.metadata.create_all(bind=engine)


app = FastAPI(title="API Gestup", lifespan=lifespan)


os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensagem": "Bem-vindo a API dos gesta+"}

@app.post("/cadastro")
def cadastrar_usuario(
    dados: UsuarioCadastro, 
    db: Session = Depends(get_db)
    ):
    
    usuario_existente = db.query(Usuario).filter(Usuario.email == dados.email).first()
    
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    usuario : Usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=gerar_hash(dados.senha),
        telefone=dados.telefone,
        idadeGestacional=dados.IdadeGestacional
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return {
            "Usuario criado com sucesso": {
                "id": usuario.id,
            }
    }

auth_scheme = OAuth2PasswordBearer(tokenUrl="/login")

@app.post("/login")
def login(
    dados: UsuarioLogin,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.email == dados.email).first()
    
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")
    
    if not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")
    
    access_token = criar_token_acesso(data={"sub": usuario.email})

    return {
        "mensagem": "Login realizado com sucesso!",
        "access_token": access_token, 
        "usuario": {
            "id": str(usuario.id),
            "nome": usuario.nome
        }
        }

def usuario_autenticado(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de acesso inválido")
    
    usuario_id = authorization.replace("Bearer ", "").strip()
    
    if not usuario_id:
         raise HTTPException(status_code=401, detail="Token de acesso inválido")
         
    return {"sub": usuario_id}

@app.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def buscar_usuario(
    usuario_id: UUID, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if str(current_user.id) != str(usuario_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar os dados deste usuário."
        )

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )
        
    return usuario


@app.get("/eventos", response_model=list[EventoGestacaoResponse])
def listar_eventos(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return db.query(EventoGestacao).filter(EventoGestacao.usuario_id == current_user.id).order_by(EventoGestacao.data, EventoGestacao.horario).all()


@app.post("/eventos", response_model=EventoGestacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_evento(dados: EventoGestacaoInput, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if dados.tipo not in {"consulta", "exame"}:
        raise HTTPException(status_code=422, detail="O tipo deve ser consulta ou exame.")
    if dados.horario:
        try:
            datetime.strptime(dados.horario, "%H:%M")
        except ValueError:
            raise HTTPException(status_code=422, detail="Informe o horário no formato HH:MM.")
    evento = EventoGestacao(usuario_id=current_user.id, **dados.model_dump())
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


@app.put("/eventos/{evento_id}", response_model=EventoGestacaoResponse)
def atualizar_evento(evento_id: UUID, dados: EventoGestacaoInput, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    evento = db.query(EventoGestacao).filter(EventoGestacao.id == evento_id, EventoGestacao.usuario_id == current_user.id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    if dados.tipo not in {"consulta", "exame"}:
        raise HTTPException(status_code=422, detail="O tipo deve ser consulta ou exame.")
    if dados.horario:
        try:
            datetime.strptime(dados.horario, "%H:%M")
        except ValueError:
            raise HTTPException(status_code=422, detail="Informe o horário no formato HH:MM.")
    for campo, valor in dados.model_dump().items():
        setattr(evento, campo, valor)
    evento.lembrete_enviado_em = None
    db.commit()
    db.refresh(evento)
    return evento


@app.patch("/eventos/{evento_id}/realizado", response_model=EventoGestacaoResponse)
def marcar_evento_realizado(evento_id: UUID, realizado: bool, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    evento = db.query(EventoGestacao).filter(EventoGestacao.id == evento_id, EventoGestacao.usuario_id == current_user.id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    evento.realizado = realizado
    db.commit()
    db.refresh(evento)
    return evento


@app.delete("/eventos/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_evento(evento_id: UUID, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    evento = db.query(EventoGestacao).filter(EventoGestacao.id == evento_id, EventoGestacao.usuario_id == current_user.id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    db.delete(evento)
    db.commit()

@app.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(
    usuario_id: uuid.UUID, 
    dados: UsuarioUpdate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if str(current_user.id) != str(usuario_id):
        raise HTTPException(status_code=403, detail="Sem permissão.")
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if dados.nome: usuario.nome = dados.nome
    if dados.telefone: usuario.telefone = dados.telefone
    if dados.idadeGestacional: usuario.idadeGestacional = dados.idadeGestacional
    
    db.commit()
    db.refresh(usuario)
    return usuario

@app.post("/feedback")
def enviar_feedback(dados: FeedbackCreate, db: Session = Depends(get_db)):
    novo_feedback = Feedback(mensagem=dados.mensagem)
    db.add(novo_feedback)
    db.commit()
    return {"mensagem": "Feedback enviado com sucesso"}

@app.get("/configuracoes/{usuario_id}")
def buscar_configuracoes(usuario_id: uuid.UUID, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    config = db.query(Configuracao).filter(Configuracao.usuario_id == usuario_id).first()
    if not config:
        config = Configuracao(usuario_id=usuario_id)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@app.put("/configuracoes/{usuario_id}")
def salvar_configuracoes(usuario_id: uuid.UUID, dados: ConfiguracaoSchema, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    config = db.query(Configuracao).filter(Configuracao.usuario_id == usuario_id).first()
    if config:
        config.modoNoturno = dados.modoNoturno
        config.textoGrande = dados.textoGrande
        config.notificacoesPush = dados.notificacoesPush
        config.lembretesEmail = dados.lembretesEmail
        db.commit()
    return {"mensagem": "Configurações salvas"}

@app.get("/notificacoes/{usuario_id}")
def buscar_notificacoes(
    usuario_id: uuid.UUID, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    if str(current_user.id) != str(usuario_id):
        raise HTTPException(status_code=403, detail="Sem permissão.")
    
    hoje = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
    limite_semana = hoje + timedelta(days=7)
    
    eventos = db.query(EventoGestacao).filter(
        EventoGestacao.usuario_id == usuario_id,
        EventoGestacao.realizado == False,
        EventoGestacao.data >= hoje,
        EventoGestacao.data <= limite_semana
    ).order_by(EventoGestacao.data).all()
    
    notificacoes = []
    
    for evento in eventos:
        dias_faltando = (evento.data - hoje).days
        horario_str = f" às {evento.horario}" if evento.horario else ""
        
        if dias_faltando == 0:
            notificacoes.append({
                "id": str(evento.id),
                "tipo": "hoje",
                "titulo": "É hoje!",
                "mensagem": f"Não se esqueça: você tem {evento.tipo} agendado para hoje{horario_str}.",
                "tempo": "Hoje"
            })
        elif dias_faltando == 1:
            notificacoes.append({
                "id": str(evento.id),
                "tipo": "amanha",
                "titulo": f"{evento.tipo.capitalize()} amanhã",
                "mensagem": f"Falta 1 dia para o seu agendamento de {evento.tipo}.",
                "tempo": "Amanhã"
            })
        elif dias_faltando == 7:
            notificacoes.append({
                "id": str(evento.id),
                "tipo": "semana",
                "titulo": "Lembrete com antecedência",
                "mensagem": f"Falta 1 semana para o seu agendamento de {evento.tipo}. Programe-se!",
                "tempo": "Em 7 dias"
            })
            
    return notificacoes