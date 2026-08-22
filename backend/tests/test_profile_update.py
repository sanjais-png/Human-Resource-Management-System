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
        email="profile_updater@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Profile Updater",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add(user)
    db.flush()

    emp = Employee(
        user_id=user.id,
        emp_code="EMP300",
        login_id="profile.updater",
        first_name="Profile",
        last_name="Updater",
        email="profile_updater@hrms.com",
        department="Operations",
        job_position="Operations Lead",
        phone="+1 555-9999",
        skills="Operations, Logistics"
    )
    db.add(emp)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token():
    res = client.post("/api/auth/login", json={"email": "profile_updater@hrms.com", "password": "pass123"})
    return res.json()["access_token"]

def test_update_personal_email_and_address():
    token = get_token()
    payload = {
        "personal_email": "updater.personal@gmail.com",
        "address": "456 Innovation Way, Suite 100",
        "phone": "+1 555-8888"
    }
    res = client.put("/api/profile/me", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["personal_email"] == "updater.personal@gmail.com"
    assert data["address"] == "456 Innovation Way, Suite 100"
    assert data["phone"] == "+1 555-8888"
