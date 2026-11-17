from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.db_model import Base
from app.database import get_db
from sqlalchemy import func, inspect as sa_inspect, or_, text
from sqlalchemy.orm import Session, joinedload, selectinload
from app.models.db_model import Usuario
from app.schemas.schemas import UsuarioCadastro
from app.services.security import gerar_hash
from app.schemas.schemas import UsuarioLogin, UsuarioResponse
from app.services.security import verificar_senha, get_current_user, criar_token_acesso
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
import os
import uuid
from typing import Optional
from uuid import UUID
from datetime import date, datetime, timedelta
from contextlib import asynccontextmanager
import asyncio
import logging
import smtplib
from email.message import EmailMessage
from zoneinfo import ZoneInfo
from app.models.db_model import (
    EventoGestacao, TopicoComunidade, MensagemComunidade,
    CurtidaTopico, CurtidaMensagem, Denuncia,
)
from app.schemas.schemas import EventoGestacaoInput, EventoGestacaoResponse
from app.models.db_model import Feedback, Configuracao
from app.schemas.schemas import (
    UsuarioUpdate, FeedbackCreate, ConfiguracaoSchema,
    TopicoComunidadeCreate, TopicoComunidadeUpdate, MensagemComunidadeCreate, MensagemComunidadeUpdate,
    TopicoComunidadeResponse, MensagemComunidadeResponse,
    CATEGORIAS_FORUM, MOTIVOS_DENUNCIA,
    DenunciaCreate, DenunciaResolucao, DenunciaResponse,
)

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
        

app = FastAPI(title="API Gestup")


def _adicionar_coluna_se_faltar(tabela: str, coluna: str, ddl: str):
    """Migração leve para bancos existentes: adiciona a coluna só se ela ainda não existir."""
    inspetor = sa_inspect(engine)
    if inspetor.has_table(tabela) and coluna not in [c["name"] for c in inspetor.get_columns(tabela)]:
        with engine.begin() as conexao:
            conexao.execute(text(ddl))


def _promover_admins():
    """Promove a moderação as contas cujo e-mail está na variável ADMIN_EMAILS (separados por vírgula)."""
    emails = [email.strip().lower() for email in os.getenv("ADMIN_EMAILS", "").split(",") if email.strip()]
    if not emails:
        return
    if not sa_inspect(engine).has_table(Usuario.__tablename__):
        return
    db = next(get_db())
    try:
        db.query(Usuario).filter(func.lower(Usuario.email).in_(emails)).update(
            {"papel": "admin"}, synchronize_session=False
        )
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def preparar_banco_forum():
    # Cria as tabelas que faltarem (novas do fórum ou de um banco recém-criado)
    Base.metadata.create_all(bind=engine)
    _adicionar_coluna_se_faltar("usuarios", "papel", "ALTER TABLE usuarios ADD COLUMN papel VARCHAR(20) NOT NULL DEFAULT 'gestante'")
    _adicionar_coluna_se_faltar("topicos_comunidade", "categoria", "ALTER TABLE topicos_comunidade ADD COLUMN categoria VARCHAR(30) NOT NULL DEFAULT 'outros'")
    _adicionar_coluna_se_faltar("topicos_comunidade", "anonima", "ALTER TABLE topicos_comunidade ADD COLUMN anonima BOOLEAN NOT NULL DEFAULT FALSE")
    _promover_admins()



origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "https://gestupcisamures.vercel.app"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.get("/cron/lembretes")
def cron_lembretes(authorization: str = Header(None)):
    segredo = os.getenv("CRON_SECRET")
    if not segredo or authorization != f"Bearer {segredo}":
        raise HTTPException(status_code=401, detail="Não autorizado")
    enviar_lembretes_pendentes()
    return {"ok": True}

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
            "nome": usuario.nome,
            "papel": usuario.papel
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


def _eh_admin(usuario: Usuario) -> bool:
    return usuario.papel == "admin"


def exigir_admin(usuario: Usuario):
    if not _eh_admin(usuario):
        raise HTTPException(status_code=403, detail="Acesso restrito à moderação.")


def _serializar_mensagem(mensagem: MensagemComunidade, current_user: Usuario) -> dict:
    return {
        "id": mensagem.id,
        "texto": mensagem.texto,
        "autor": mensagem.autor.nome,
        "criado_em": mensagem.criado_em,
        "sou_autor": mensagem.usuario_id == current_user.id,
        "curtidas": len(mensagem.curtidas),
        "curtiu": any(curtida.usuario_id == current_user.id for curtida in mensagem.curtidas),
    }


def _serializar_topico(topico: TopicoComunidade, current_user: Usuario) -> dict:
    sou_autor = topico.usuario_id == current_user.id
    eh_admin = _eh_admin(current_user)
    # Pergunta anônima: as outras usuárias veem "Anônima"; a autora e a moderação veem o nome real.
    anonima_para_mim = topico.anonima and not sou_autor and not eh_admin
    return {
        "id": topico.id,
        "titulo": topico.titulo,
        "mensagem_inicial": topico.mensagem_inicial,
        "categoria": topico.categoria,
        "anonima": topico.anonima,
        "autor": "Anônima" if anonima_para_mim else topico.autor.nome,
        "autor_real": topico.autor.nome if topico.anonima and eh_admin and not sou_autor else None,
        "criado_em": topico.criado_em,
        "sou_autor": sou_autor,
        "curtidas": len(topico.curtidas),
        "curtiu": any(curtida.usuario_id == current_user.id for curtida in topico.curtidas),
        "mensagens": [_serializar_mensagem(mensagem, current_user) for mensagem in topico.mensagens],
    }


@app.get("/comunidade/topicos", response_model=list[TopicoComunidadeResponse])
def listar_topicos_comunidade(
    categoria: Optional[str] = None,
    busca: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    consulta = db.query(TopicoComunidade).options(
        joinedload(TopicoComunidade.autor),
        selectinload(TopicoComunidade.curtidas),
        selectinload(TopicoComunidade.mensagens).joinedload(MensagemComunidade.autor),
        selectinload(TopicoComunidade.mensagens).selectinload(MensagemComunidade.curtidas),
    )
    if categoria and categoria != "todos":
        consulta = consulta.filter(TopicoComunidade.categoria == categoria)
    if busca and busca.strip():
        termo = f"%{busca.strip()}%"
        consulta = consulta.filter(or_(
            TopicoComunidade.titulo.ilike(termo),
            TopicoComunidade.mensagem_inicial.ilike(termo),
        ))
    topicos = consulta.order_by(TopicoComunidade.criado_em.desc()).limit(100).all()
    return [_serializar_topico(topico, current_user) for topico in topicos]


@app.post("/comunidade/topicos", response_model=TopicoComunidadeResponse, status_code=status.HTTP_201_CREATED)
def criar_topico_comunidade(
    dados: TopicoComunidadeCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    titulo = dados.titulo.strip()
    mensagem_inicial = dados.mensagem.strip()
    if len(titulo) < 4 or not mensagem_inicial:
        raise HTTPException(status_code=422, detail="Informe um título e uma mensagem para iniciar o tópico.")
    if dados.categoria not in CATEGORIAS_FORUM:
        raise HTTPException(status_code=422, detail="Categoria inválida.")
    topico = TopicoComunidade(
        usuario_id=current_user.id,
        titulo=titulo,
        mensagem_inicial=mensagem_inicial,
        categoria=dados.categoria,
        anonima=dados.anonima,
    )
    db.add(topico)
    db.commit()
    db.refresh(topico)
    return _serializar_topico(topico, current_user)


@app.put("/comunidade/topicos/{topico_id}", response_model=TopicoComunidadeResponse)
def atualizar_topico_comunidade(
    topico_id: UUID,
    dados: TopicoComunidadeUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    topico = db.query(TopicoComunidade).filter(TopicoComunidade.id == topico_id).first()
    if not topico:
        raise HTTPException(status_code=404, detail="Tópico não encontrado.")
    if topico.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você só pode editar as suas perguntas.")
    if dados.titulo is not None:
        titulo = dados.titulo.strip()
        if len(titulo) < 4:
            raise HTTPException(status_code=422, detail="O título precisa ter pelo menos 4 caracteres.")
        topico.titulo = titulo
    if dados.mensagem is not None:
        mensagem = dados.mensagem.strip()
        if not mensagem:
            raise HTTPException(status_code=422, detail="A mensagem não pode ficar vazia.")
        topico.mensagem_inicial = mensagem
    if dados.categoria is not None:
        if dados.categoria not in CATEGORIAS_FORUM:
            raise HTTPException(status_code=422, detail="Categoria inválida.")
        topico.categoria = dados.categoria
    db.commit()
    db.refresh(topico)
    return _serializar_topico(topico, current_user)


@app.delete("/comunidade/topicos/{topico_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_topico_comunidade(
    topico_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    topico = db.query(TopicoComunidade).filter(TopicoComunidade.id == topico_id).first()
    if not topico:
        raise HTTPException(status_code=404, detail="Tópico não encontrado.")
    if topico.usuario_id != current_user.id and not _eh_admin(current_user):
        raise HTTPException(status_code=403, detail="Você só pode excluir as suas perguntas.")
    db.delete(topico)
    db.commit()


@app.post(
    "/comunidade/topicos/{topico_id}/mensagens",
    response_model=MensagemComunidadeResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_mensagem_comunidade(
    topico_id: UUID,
    dados: MensagemComunidadeCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    topico = db.query(TopicoComunidade).filter(TopicoComunidade.id == topico_id).first()
    if not topico:
        raise HTTPException(status_code=404, detail="Tópico não encontrado.")
    texto = dados.texto.strip()
    if not texto:
        raise HTTPException(status_code=422, detail="Escreva uma mensagem antes de enviar.")
    mensagem = MensagemComunidade(topico_id=topico.id, usuario_id=current_user.id, texto=texto)
    db.add(mensagem)
    db.commit()
    db.refresh(mensagem)
    return _serializar_mensagem(mensagem, current_user)


def _buscar_mensagem_da_rota(mensagem_id: UUID, db: Session) -> MensagemComunidade:
    mensagem = db.query(MensagemComunidade).filter(MensagemComunidade.id == mensagem_id).first()
    if not mensagem:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada.")
    return mensagem


@app.put("/comunidade/mensagens/{mensagem_id}", response_model=MensagemComunidadeResponse)
def atualizar_mensagem_comunidade(
    mensagem_id: UUID,
    dados: MensagemComunidadeUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    mensagem = _buscar_mensagem_da_rota(mensagem_id, db)
    if mensagem.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você só pode editar as suas respostas.")
    if dados.texto is not None:
        texto = dados.texto.strip()
        if not texto:
            raise HTTPException(status_code=422, detail="A resposta não pode ficar vazia.")
        mensagem.texto = texto
    db.commit()
    db.refresh(mensagem)
    return _serializar_mensagem(mensagem, current_user)


@app.delete("/comunidade/mensagens/{mensagem_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_mensagem_comunidade(
    mensagem_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    mensagem = _buscar_mensagem_da_rota(mensagem_id, db)
    if mensagem.usuario_id != current_user.id and not _eh_admin(current_user):
        raise HTTPException(status_code=403, detail="Você só pode excluir as suas respostas.")
    db.delete(mensagem)
    db.commit()


@app.post("/comunidade/topicos/{topico_id}/curtir")
def curtir_topico_comunidade(
    topico_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    topico = db.query(TopicoComunidade).filter(TopicoComunidade.id == topico_id).first()
    if not topico:
        raise HTTPException(status_code=404, detail="Tópico não encontrado.")
    curtida = db.query(CurtidaTopico).filter(
        CurtidaTopico.topico_id == topico.id,
        CurtidaTopico.usuario_id == current_user.id,
    ).first()
    if curtida:
        db.delete(curtida)
        db.commit()
        curtiu = False
    else:
        db.add(CurtidaTopico(topico_id=topico.id, usuario_id=current_user.id))
        db.commit()
        curtiu = True
    total = db.query(func.count(CurtidaTopico.id)).filter(CurtidaTopico.topico_id == topico.id).scalar()
    return {"curtiu": curtiu, "curtidas": total}


@app.post("/comunidade/mensagens/{mensagem_id}/curtir")
def curtir_mensagem_comunidade(
    mensagem_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    mensagem = _buscar_mensagem_da_rota(mensagem_id, db)
    curtida = db.query(CurtidaMensagem).filter(
        CurtidaMensagem.mensagem_id == mensagem.id,
        CurtidaMensagem.usuario_id == current_user.id,
    ).first()
    if curtida:
        db.delete(curtida)
        db.commit()
        curtiu = False
    else:
        db.add(CurtidaMensagem(mensagem_id=mensagem.id, usuario_id=current_user.id))
        db.commit()
        curtiu = True
    total = db.query(func.count(CurtidaMensagem.id)).filter(CurtidaMensagem.mensagem_id == mensagem.id).scalar()
    return {"curtiu": curtiu, "curtidas": total}


@app.post("/comunidade/denuncias", status_code=status.HTTP_201_CREATED)
def criar_denuncia(
    dados: DenunciaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if dados.tipo not in {"topico", "mensagem"}:
        raise HTTPException(status_code=422, detail="Tipo de denúncia inválido.")
    if dados.motivo not in MOTIVOS_DENUNCIA:
        raise HTTPException(status_code=422, detail="Motivo da denúncia inválido.")

    topico_id = None
    mensagem_id = None
    if dados.tipo == "topico":
        topico = db.query(TopicoComunidade).filter(TopicoComunidade.id == dados.conteudo_id).first()
        if not topico:
            raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")
        topico_id = topico.id
    else:
        mensagem = db.query(MensagemComunidade).filter(MensagemComunidade.id == dados.conteudo_id).first()
        if not mensagem:
            raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")
        topico_id = mensagem.topico_id
        mensagem_id = mensagem.id

    duplicada = db.query(Denuncia).filter(
        Denuncia.usuario_id == current_user.id,
        Denuncia.tipo == dados.tipo,
        Denuncia.topico_id == topico_id,
        Denuncia.mensagem_id == mensagem_id,
    ).first()
    if duplicada:
        raise HTTPException(status_code=409, detail="Você já denunciou este conteúdo.")

    denuncia = Denuncia(
        tipo=dados.tipo,
        topico_id=topico_id,
        mensagem_id=mensagem_id,
        usuario_id=current_user.id,
        motivo=dados.motivo,
        detalhes=(dados.detalhes or "").strip() or None,
    )
    db.add(denuncia)
    db.commit()
    db.refresh(denuncia)
    return {"mensagem": "Denúncia registrada. Nossa moderação vai analisar."}


def _serializar_denuncia(denuncia: Denuncia) -> dict:
    conteudo = "(conteúdo removido)"
    autor_conteudo = ""
    if denuncia.tipo == "topico" and denuncia.topico:
        conteudo = denuncia.topico.titulo
        autor_conteudo = denuncia.topico.autor.nome
    elif denuncia.mensagem:
        conteudo = denuncia.mensagem.texto
        autor_conteudo = denuncia.mensagem.autor.nome
    return {
        "id": denuncia.id,
        "tipo": denuncia.tipo,
        "motivo": denuncia.motivo,
        "detalhes": denuncia.detalhes,
        "status": denuncia.status,
        "criada_em": denuncia.criada_em,
        "resolvida_em": denuncia.resolvida_em,
        "denunciante": denuncia.denunciante.nome,
        "conteudo": conteudo,
        "autor_conteudo": autor_conteudo,
        "topico_id": denuncia.topico_id,
        "mensagem_id": denuncia.mensagem_id,
    }


@app.get("/moderacao/denuncias", response_model=list[DenunciaResponse])
def listar_denuncias(
    status_filtro: Optional[str] = "pendente",
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    exigir_admin(current_user)
    consulta = db.query(Denuncia)
    if status_filtro and status_filtro != "todas":
        consulta = consulta.filter(Denuncia.status == status_filtro)
    denuncias = consulta.order_by(Denuncia.criada_em.desc()).limit(200).all()
    return [_serializar_denuncia(denuncia) for denuncia in denuncias]


@app.post("/moderacao/denuncias/{denuncia_id}/resolver", response_model=DenunciaResponse)
def resolver_denuncia(
    denuncia_id: UUID,
    dados: DenunciaResolucao,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    exigir_admin(current_user)
    if dados.acao not in {"ignorar", "remover"}:
        raise HTTPException(status_code=422, detail="Ação inválida: use ignorar ou remover.")
    denuncia = db.query(Denuncia).filter(Denuncia.id == denuncia_id).first()
    if not denuncia:
        raise HTTPException(status_code=404, detail="Denúncia não encontrada.")
    if denuncia.status == "resolvida":
        raise HTTPException(status_code=400, detail="Esta denúncia já foi resolvida.")
    if dados.acao == "remover":
        if denuncia.tipo == "topico" and denuncia.topico:
            db.delete(denuncia.topico)
        elif denuncia.mensagem:
            db.delete(denuncia.mensagem)
    denuncia.status = "resolvida"
    denuncia.resolvida_em = datetime.utcnow()
    db.commit()
    db.refresh(denuncia)
    return _serializar_denuncia(denuncia)

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
