import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, UserRole
from app.main import app
from app.auth import get_password_hash

# Use StaticPool so all threads share the same in-memory SQLite DB
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

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    admin = User(
        email="admin_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Admin Test",
        role=UserRole.ADMIN,
        is_active=True
    )
    emp = User(
        email="emp_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Emp Test",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add(admin)
    db.add(emp)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_login_success():
    response = client.post("/api/auth/login", json={"email": "admin_test@hrms.com", "password": "pass123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin_test@hrms.com"
    assert data["user"]["role"] == "ADMIN"

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={"email": "admin_test@hrms.com", "password": "wrongpassword"})
    assert response.status_code == 401

def test_protected_route_unauthenticated():
    response = client.get("/api/auth/protected")
    assert response.status_code == 401

def test_current_user_me_endpoint():
    login_res = client.post("/api/auth/login", json={"email": "emp_test@hrms.com", "password": "pass123"})
    token = login_res.json()["access_token"]
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "emp_test@hrms.com"
    assert user_data["role"] == "EMPLOYEE"

def test_rbac_admin_only_endpoint():
    # Login as Employee
    login_emp = client.post("/api/auth/login", json={"email": "emp_test@hrms.com", "password": "pass123"})
    token_emp = login_emp.json()["access_token"]
    
    # Employee attempting admin endpoint should fail with 403
    res_emp = client.get("/api/auth/admin-only", headers={"Authorization": f"Bearer {token_emp}"})
    assert res_emp.status_code == 403
    
    # Login as Admin
    login_admin = client.post("/api/auth/login", json={"email": "admin_test@hrms.com", "password": "pass123"})
    token_admin = login_admin.json()["access_token"]
    
    # Admin attempting admin endpoint should succeed
    res_admin = client.get("/api/auth/admin-only", headers={"Authorization": f"Bearer {token_admin}"})
    assert res_admin.status_code == 200
