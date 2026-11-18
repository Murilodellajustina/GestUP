import os

# Ambiente de teste: precisa ser configurado antes de importar a aplicação
os.environ.setdefault("SECRET_KEY", "chave-de-teste")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_gestup.db")

import pytest
from fastapi.testclient import TestClient

from app.database import engine
from app.main import app
from app.models.db_model import Base


@pytest.fixture()
def cliente():
    # Banco limpo a cada teste para os testes ficarem independentes entre si
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        yield client
