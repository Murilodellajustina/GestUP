import pytest
from app.database import SessionLocal
from app.models.db_model import Usuario


def criar_e_logar(cliente, nome, email, senha="senha123", admin=False):
    """Cadastra uma usuária, promove a admin se pedido e devolve (headers de auth, dados da usuária)."""
    resposta = cliente.post("/cadastro", json={
        "nome": nome,
        "telefone": "11999999999",
        "IdadeGestacional": "2026-08-01",
        "email": email,
        "senha": senha,
    })
    assert resposta.status_code == 200, resposta.text

    if admin:
        db = SessionLocal()
        try:
            usuario = db.query(Usuario).filter(Usuario.email == email).first()
            usuario.papel = "admin"
            db.commit()
        finally:
            db.close()

    resposta = cliente.post("/login", json={"email": email, "senha": senha})
    assert resposta.status_code == 200, resposta.text
    dados = resposta.json()
    headers = {"Authorization": f"Bearer {dados['access_token']}"}
    return headers, dados["usuario"]


def criar_topico(cliente, headers, **extras):
    corpo = {"titulo": "Dúvida sobre enjoo no primeiro trimestre", "mensagem": "Alguém mais passou por isso?"}
    corpo.update(extras)
    return cliente.post("/comunidade/topicos", json=corpo, headers=headers)


def test_login_retorna_papel_da_usuaria(cliente):
    _, usuario = criar_e_logar(cliente, "Ana", "ana@teste.com")
    assert usuario["papel"] == "gestante"

    _, admin = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)
    assert admin["papel"] == "admin"


def test_pergunta_anonima_esconde_autora_de_outras_usuarias(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    headers_admin, _ = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)

    resposta = criar_topico(cliente, headers_ana, anonima=True, categoria="1º trimestre")
    assert resposta.status_code == 201, resposta.text
    topico = resposta.json()

    # A própria autora se vê pelo nome real
    assert topico["autor"] == "Ana"
    assert topico["sou_autor"] is True
    assert topico["categoria"] == "1º trimestre"

    # Outra gestante vê "Anônima" e não recebe o nome real
    topico_bruna = cliente.get("/comunidade/topicos", headers=headers_bruna).json()[0]
    assert topico_bruna["autor"] == "Anônima"
    assert topico_bruna["autor_real"] is None
    assert topico_bruna["sou_autor"] is False

    # A moderação vê quem postou
    topico_admin = cliente.get("/comunidade/topicos", headers=headers_admin).json()[0]
    assert topico_admin["autor"] == "Ana"
    assert topico_admin["autor_real"] == "Ana"


def test_categoria_invalida_e_rejeitada(cliente):
    headers, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    resposta = criar_topico(cliente, headers, categoria="categoria-inventada")
    assert resposta.status_code == 422


def test_filtro_por_categoria_e_busca(cliente):
    headers, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    assert criar_topico(cliente, headers, categoria="alimentação",
                        titulo="Alimentação nos primeiros meses").status_code == 201
    assert criar_topico(cliente, headers, categoria="emocional",
                        titulo="Medo do parto").status_code == 201

    por_categoria = cliente.get("/comunidade/topicos", params={"categoria": "alimentação"}, headers=headers).json()
    assert len(por_categoria) == 1
    assert por_categoria[0]["titulo"] == "Alimentação nos primeiros meses"

    por_busca = cliente.get("/comunidade/topicos", params={"busca": "parto"}, headers=headers).json()
    assert len(por_busca) == 1
    assert por_busca[0]["titulo"] == "Medo do parto"


def test_responder_pergunta(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    topico_id = criar_topico(cliente, headers_ana).json()["id"]

    resposta = cliente.post(f"/comunidade/topicos/{topico_id}/mensagens",
                            json={"texto": "Passei sim, melhorou depois do terceiro mês."},
                            headers=headers_bruna)
    assert resposta.status_code == 201, resposta.text
    assert resposta.json()["autor"] == "Bruna"

    topico_ana = cliente.get("/comunidade/topicos", headers=headers_ana).json()[0]
    assert len(topico_ana["mensagens"]) == 1
    assert topico_ana["mensagens"][0]["sou_autor"] is False

    topico_bruna = cliente.get("/comunidade/topicos", headers=headers_bruna).json()[0]
    assert topico_bruna["mensagens"][0]["sou_autor"] is True


def test_curtir_e_descurtir_pergunta(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    topico_id = criar_topico(cliente, headers_ana).json()["id"]

    curtida = cliente.post(f"/comunidade/topicos/{topico_id}/curtir", headers=headers_bruna).json()
    assert curtida == {"curtiu": True, "curtidas": 1}

    # A lista reflete a curtida para quem curtiu
    topico_bruna = cliente.get("/comunidade/topicos", headers=headers_bruna).json()[0]
    assert topico_bruna["curtidas"] == 1
    assert topico_bruna["curtiu"] is True

    # Curtir de novo descurte (toggle)
    curtida = cliente.post(f"/comunidade/topicos/{topico_id}/curtir", headers=headers_bruna).json()
    assert curtida == {"curtiu": False, "curtidas": 0}


def test_curtir_resposta(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    topico_id = criar_topico(cliente, headers_ana).json()["id"]
    mensagem_id = cliente.post(f"/comunidade/topicos/{topico_id}/mensagens",
                               json={"texto": "Também tive enjoo!"},
                               headers=headers_bruna).json()["id"]

    curtida = cliente.post(f"/comunidade/mensagens/{mensagem_id}/curtir", headers=headers_ana).json()
    assert curtida == {"curtiu": True, "curtidas": 1}

    topico_ana = cliente.get("/comunidade/topicos", headers=headers_ana).json()[0]
    assert topico_ana["mensagens"][0]["curtiu"] is True


def test_editar_e_excluir_propria_pergunta(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    topico_id = criar_topico(cliente, headers_ana).json()["id"]

    # Outra usuária não pode editar nem excluir
    assert cliente.put(f"/comunidade/topicos/{topico_id}", json={"titulo": "Tentativa de edição"},
                       headers=headers_bruna).status_code == 403
    assert cliente.delete(f"/comunidade/topicos/{topico_id}", headers=headers_bruna).status_code == 403

    # A autora edita e exclui
    resposta = cliente.put(f"/comunidade/topicos/{topico_id}",
                           json={"titulo": "Dúvida sobre enjoo (editada)", "categoria": "alimentação"},
                           headers=headers_ana)
    assert resposta.status_code == 200
    assert resposta.json()["titulo"] == "Dúvida sobre enjoo (editada)"
    assert resposta.json()["categoria"] == "alimentação"

    assert cliente.delete(f"/comunidade/topicos/{topico_id}", headers=headers_ana).status_code == 204
    assert cliente.get("/comunidade/topicos", headers=headers_ana).json() == []


def test_admin_pode_excluir_pergunta_de_outra_usuaria(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_admin, _ = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)
    topico_id = criar_topico(cliente, headers_ana).json()["id"]

    assert cliente.delete(f"/comunidade/topicos/{topico_id}", headers=headers_admin).status_code == 204
    assert cliente.get("/comunidade/topicos", headers=headers_ana).json() == []


def test_editar_e_excluir_resposta(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    headers_admin, _ = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)
    topico_id = criar_topico(cliente, headers_ana).json()["id"]
    mensagem_id = cliente.post(f"/comunidade/topicos/{topico_id}/mensagens",
                               json={"texto": "Resposta original"},
                               headers=headers_bruna).json()["id"]

    # Quem não é a autora não edita
    assert cliente.put(f"/comunidade/mensagens/{mensagem_id}", json={"texto": "Edição indevida"},
                       headers=headers_ana).status_code == 403

    # A autora edita
    resposta = cliente.put(f"/comunidade/mensagens/{mensagem_id}", json={"texto": "Resposta editada"},
                           headers=headers_bruna)
    assert resposta.status_code == 200
    assert resposta.json()["texto"] == "Resposta editada"

    # A moderação pode excluir a resposta de outra usuária
    assert cliente.delete(f"/comunidade/mensagens/{mensagem_id}", headers=headers_admin).status_code == 204
    topico = cliente.get("/comunidade/topicos", headers=headers_ana).json()[0]
    assert topico["mensagens"] == []


def test_denunciar_conteudo_e_painel_da_moderacao(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    headers_admin, _ = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)
    topico_id = criar_topico(cliente, headers_ana).json()["id"]

    denuncia = cliente.post("/comunidade/denuncias", json={
        "tipo": "topico", "conteudo_id": topico_id,
        "motivo": "desinformação", "detalhes": "Conteúdo parece conter orientação médica perigosa.",
    }, headers=headers_bruna)
    assert denuncia.status_code == 201, denuncia.text

    # Denúncia duplicada da mesma usuária é bloqueada
    assert cliente.post("/comunidade/denuncias", json={
        "tipo": "topico", "conteudo_id": topico_id, "motivo": "spam",
    }, headers=headers_bruna).status_code == 409

    # Motivo fora da lista é rejeitado
    assert cliente.post("/comunidade/denuncias", json={
        "tipo": "topico", "conteudo_id": topico_id, "motivo": "motivo-inventado",
    }, headers=headers_bruna).status_code == 422

    # Gestante comum não acessa o painel de moderação
    assert cliente.get("/moderacao/denuncias", headers=headers_ana).status_code == 403

    # A moderação vê a denúncia com o nome real de quem postou
    denuncias = cliente.get("/moderacao/denuncias", headers=headers_admin).json()
    assert len(denuncias) == 1
    assert denuncias[0]["status"] == "pendente"
    assert denuncias[0]["denunciante"] == "Bruna"
    assert denuncias[0]["autor_conteudo"] == "Ana"
    assert denuncias[0]["conteudo"] == "Dúvida sobre enjoo no primeiro trimestre"


def test_resolver_denuncia_removendo_conteudo(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    headers_admin, _ = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)
    topico_id = criar_topico(cliente, headers_ana).json()["id"]

    cliente.post("/comunidade/denuncias", json={
        "tipo": "topico", "conteudo_id": topico_id, "motivo": "conteúdo ofensivo",
    }, headers=headers_bruna)
    denuncia_id = cliente.get("/moderacao/denuncias", headers=headers_admin).json()[0]["id"]

    resolucao = cliente.post(f"/moderacao/denuncias/{denuncia_id}/resolver", json={"acao": "remover"},
                             headers=headers_admin)
    assert resolucao.status_code == 200, resolucao.text
    assert resolucao.json()["status"] == "resolvida"

    # O conteúdo foi removido do fórum
    assert cliente.get("/comunidade/topicos", headers=headers_ana).json() == []

    # A denúncia resolvida fica no histórico, sem o conteúdo
    resolvidas = cliente.get("/moderacao/denuncias", params={"status_filtro": "resolvida"},
                             headers=headers_admin).json()
    assert len(resolvidas) == 1
    assert resolvidas[0]["conteudo"] == "(conteúdo removido)"

    # Resolver de novo é recusado
    assert cliente.post(f"/moderacao/denuncias/{denuncia_id}/resolver", json={"acao": "remover"},
                        headers=headers_admin).status_code == 400


def test_resolver_denuncia_ignorando(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    headers_admin, _ = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)
    topico_id = criar_topico(cliente, headers_ana).json()["id"]

    cliente.post("/comunidade/denuncias", json={
        "tipo": "topico", "conteudo_id": topico_id, "motivo": "spam",
    }, headers=headers_bruna)
    denuncia_id = cliente.get("/moderacao/denuncias", headers=headers_admin).json()[0]["id"]

    resposta = cliente.post(f"/moderacao/denuncias/{denuncia_id}/resolver", json={"acao": "ignorar"},
                            headers=headers_admin)
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "resolvida"

    # O conteúdo continua no fórum
    topicos = cliente.get("/comunidade/topicos", headers=headers_ana).json()
    assert len(topicos) == 1


def test_denunciar_e_remover_resposta(cliente):
    headers_ana, _ = criar_e_logar(cliente, "Ana", "ana@teste.com")
    headers_bruna, _ = criar_e_logar(cliente, "Bruna", "bruna@teste.com")
    headers_admin, _ = criar_e_logar(cliente, "Moderadora", "mod@teste.com", admin=True)
    topico_id = criar_topico(cliente, headers_ana).json()["id"]
    mensagem_id = cliente.post(f"/comunidade/topicos/{topico_id}/mensagens",
                               json={"texto": "Resposta inadequada"},
                               headers=headers_bruna).json()["id"]

    denuncia = cliente.post("/comunidade/denuncias", json={
        "tipo": "mensagem", "conteudo_id": mensagem_id, "motivo": "assédio ou constrangimento",
    }, headers=headers_ana)
    assert denuncia.status_code == 201

    denuncia_id = cliente.get("/moderacao/denuncias", headers=headers_admin).json()[0]["id"]
    resposta = cliente.post(f"/moderacao/denuncias/{denuncia_id}/resolver", json={"acao": "remover"},
                            headers=headers_admin)
    assert resposta.status_code == 200

    # A resposta some, mas a pergunta continua
    topico = cliente.get("/comunidade/topicos", headers=headers_ana).json()[0]
    assert topico["mensagens"] == []
    assert topico["id"] == topico_id
