import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

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
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def test_signup_user_success():
    payload = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe.signup@hrms.com",
        "password": "pass123signup",
        "role": "EMPLOYEE",
        "department": "Engineering",
        "job_position": "Backend Developer"
    }
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "john.doe.signup@hrms.com"

def test_signup_with_custom_emp_code():
    payload = {
        "emp_code": "OIJODO20220001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe.custom@hrms.com",
        "password": "pass123signup",
        "role": "EMPLOYEE"
    }
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 201
    assert "access_token" in res.json()

def test_signup_fails_when_employee_id_duplicate():
    payload1 = {
        "emp_code": "OIJODO20220001",
        "first_name": "First",
        "last_name": "User",
        "email": "user1@hrms.com",
        "password": "pass123signup",
        "role": "EMPLOYEE"
    }
    res1 = client.post("/api/auth/signup", json=payload1)
    assert res1.status_code == 201

    payload2 = {
        "emp_code": "OIJODO20220001",
        "first_name": "Second",
        "last_name": "User",
        "email": "user2@hrms.com",
        "password": "pass123signup",
        "role": "EMPLOYEE"
    }
    res2 = client.post("/api/auth/signup", json=payload2)
    assert res2.status_code == 400
    assert "Employee ID already registered" in res2.json()["detail"]
