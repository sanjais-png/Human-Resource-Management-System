import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, Employee, UserRole
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

    user = User(
        email="search_tester@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Search Tester",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(user)
    db.flush()

    e1 = Employee(
        user_id=user.id,
        emp_code="EMP099",
        login_id="search.tester",
        first_name="Search",
        last_name="Tester",
        email="search_tester@hrms.com",
        department="Engineering",
        job_position="QA Engineer",
        status="Present"
    )
    db.add(e1)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token():
    res = client.post("/api/auth/login", json={"email": "search_tester@hrms.com", "password": "pass123"})
    return res.json()["access_token"]

def test_employee_not_found_404():
    token = get_token()
    res = client.get("/api/employees/9999", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 404

def test_employee_partial_search():
    token = get_token()
    res = client.get("/api/employees?query=Engine", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1
