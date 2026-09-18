import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.utils.seed_data import seed_database_if_empty

TEST_DATABASE_URL = "sqlite:///./test_darukaa.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database_if_empty(db)
    db.close()
    yield
    try:
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_darukaa.db"):
            os.remove("./test_darukaa.db")
    except Exception:
        pass

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
