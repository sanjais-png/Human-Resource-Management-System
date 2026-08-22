import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, Employee, Attendance, UserRole
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

    admin = User(
        email="admin_att_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Admin Att Test",
        role=UserRole.ADMIN,
        is_active=True
    )
    emp_user = User(
        email="emp_att_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Emp Att Test",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add_all([admin, emp_user])
    db.flush()

    emp = Employee(
        user_id=emp_user.id,
        emp_code="EMP201",
        login_id="emp.att",
        first_name="Emp",
        last_name="Att",
        email="emp_att_test@hrms.com",
        department="Engineering",
        job_position="Engineer",
        status="Present"
    )
    db.add(emp)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token(email: str):
    res = client.post("/api/auth/login", json={"email": email, "password": "pass123"})
    return res.json()["access_token"]

def test_check_in_success():
    token = get_token("emp_att_test@hrms.com")
    res = client.post("/api/attendance/check-in", json={}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["date"] == date.today().isoformat()
    assert data["check_in"] is not None
    assert data["status"] == "Present"

def test_duplicate_check_in_rejection():
    token = get_token("emp_att_test@hrms.com")
    # First check in
    client.post("/api/attendance/check-in", json={}, headers={"Authorization": f"Bearer {token}"})
    
    # Second check in should return 400 Bad Request
    res2 = client.post("/api/attendance/check-in", json={}, headers={"Authorization": f"Bearer {token}"})
    assert res2.status_code == 400
    assert "Already checked in" in res2.json()["detail"]

def test_check_out_without_check_in_rejection():
    token = get_token("emp_att_test@hrms.com")
    res = client.post("/api/attendance/check-out", json={}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 400
    assert "Check-out requires an active check-in" in res.json()["detail"]

def test_check_in_and_check_out_flow():
    token = get_token("emp_att_test@hrms.com")
    in_res = client.post("/api/attendance/check-in", json={}, headers={"Authorization": f"Bearer {token}"})
    assert in_res.status_code == 200

    out_res = client.post("/api/attendance/check-out", json={}, headers={"Authorization": f"Bearer {token}"})
    assert out_res.status_code == 200
    data = out_res.json()
    assert data["check_out"] is not None
    assert "work_hours" in data

def test_admin_can_view_all_attendance():
    emp_token = get_token("emp_att_test@hrms.com")
    client.post("/api/attendance/check-in", json={}, headers={"Authorization": f"Bearer {emp_token}"})

    admin_token = get_token("admin_att_test@hrms.com")
    res = client.get("/api/attendance/admin/all", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1
