# README.md — GestUP

# GestUP

Aplicação web para acompanhamento da gestação. O projeto reúne uma interface web em React e uma API em Python com FastAPI. A tela de cadastro inclui informação sobre a DUM (Data da Última Menstruação), utilizada como referência no contexto do acompanhamento gestacional.

O **Fórum** é o espaço onde as gestantes tiram dúvidas entre si: cada uma publica perguntas (com opção de anônimo) em categorias como trimestre, alimentação e emocional, responde as perguntas das outras, curta publicações e denuncia conteúdos inadequados para a moderação.

> **Atenção:** o GestUP é uma ferramenta informativa e não substitui consultas, exames ou orientações de profissionais de saúde. As respostas do fórum vêm de outras gestantes e não são orientação médica.

## Acesso

- **Aplicação publicada:** https://gestupcisamures.vercel.app/
- **Repositório:** https://github.com/Murilodellajustina/GestUP

## Tecnologias

- **Frontend:** JavaScript, React e Vite
- **Backend:** Python, FastAPI, SQLAlchemy e PostgreSQL (psycopg)
- **Autenticação/validação:** PyJWT, Passlib, bcrypt e Pydantic Email

## Estrutura do projeto

```text
GestUP/
├── backend/
│   ├── app/             # Aplicação e rotas da API
│   ├── tests/           # Testes do backend
│   ├── requirements.txt
│   └── vercel.json
└── frontend/
    ├── public/          # Arquivos públicos
    ├── src/             # Código da interface
    ├── package.json
    └── vite.config.js
```

## Pré-requisitos

- Python 3.10 ou superior
- Node.js e npm
- PostgreSQL, se a configuração local da API utilizar banco de dados

## Como executar localmente

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/Murilodellajustina/GestUP.git
cd GestUP
```

### Backend

Crie e ative um ambiente virtual, instale as dependências e inicie a API:

```bash
cd backend
python -m venv venv
```

No Windows (PowerShell):

```powershell
.\venv\Scripts\Activate.ps1
```

No macOS/Linux:

```bash
source venv/bin/activate
```

Instale as dependências listadas no projeto e rode o servidor:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

A API ficará disponível, por padrão, em `http://127.0.0.1:8000`. A documentação interativa do FastAPI geralmente pode ser acessada em `http://127.0.0.1:8000/docs`.

Configure as variáveis de ambiente e a conexão com o banco de dados conforme a configuração da aplicação. Não compartilhe credenciais nem envie arquivos `.env` ao repositório.

### Frontend

Em outro terminal, na raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local da interface (normalmente `http://localhost:5173`). Para gerar a versão de produção:

```bash
npm run build
```

## Testes

Os testes do backend estão organizados em `backend/tests/`. Para rodá-los, na pasta `backend` e com o ambiente virtual ativado:

```bash
pip install -r requirements.txt pytest httpx
python -m pytest tests/
```

Os testes do fórum (`tests/test_forum.py`) cobrem perguntas anônimas, categorias, curtidas, edição/exclusão do próprio conteúdo, denúncias e o painel de moderação.

## Moderação do fórum

A conta de moderação é definida pela variável de ambiente `ADMIN_EMAILS` (e-mails separados por vírgula). No startup da API, essas contas recebem o papel `admin`, que dá acesso ao painel de denúncias em `/moderacao`, onde é possível remover ou ignorar conteúdos denunciados. As perguntas anônimas têm o nome da autora visível apenas para a própria e para a moderação.

## Contribuição

1. Faça um fork do repositório.
2. Crie uma branch para sua alteração: `git checkout -b minha-alteracao`.
3. Faça as alterações e valide a aplicação localmente.
4. Envie um pull request com uma descrição clara do que foi modificado.

## Licença

Nenhuma licença foi identificada nas informações públicas consultadas do repositório. Antes de reutilizar ou distribuir este código, confirme a licença com os mantenedores.

## Créditos

Desenvolvido por [Murilo Della Justina e colaboradores](https://github.com/Murilodellajustina/GestUP/graphs/contributors).