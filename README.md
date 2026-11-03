python -m venv venv

.\venv\Scripts\Activate
pip install fastapi uvicorn
pip install fastapi uvicorn sqlalchemy
pip install fastapi uvicorn psycopg
pip install psycopg[binary]
pip install pydantic[email]
python -m pip install passlib==1.7.4 bcrypt==4.0.1
python -m pip install PyJWT

uvicorn app.main:app --reload