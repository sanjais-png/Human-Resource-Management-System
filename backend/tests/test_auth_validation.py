import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, UserRole
from app.main import app
from app.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_test_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    inactive_user = User(
        email="inactive@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Inactive User",
        role=UserRole.EMPLOYEE,
        is_active=False
    )
    db.add(inactive_user)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def test_login_missing_fields():
    res = client.post("/api/auth/login", json={"email": "inactive@hrms.com"})
    assert res.status_code == 400

def test_login_inactive_user():
    res = client.post("/api/auth/login", json={"email": "inactive@hrms.com", "password": "pass123"})
    assert res.status_code == 400
    assert "Inactive" in res.json()["detail"]

def test_invalid_bearer_token_format():
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_xyz"})
    assert res.status_code == 401

def test_missing_auth_header():
    res = client.get("/api/auth/me")
    assert res.status_code == 401
