import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, Employee, UserRole, LeaveBalance
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

    hr = User(
        email="hr_cancel_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="HR Cancel Test",
        role=UserRole.HR,
        is_active=True
    )
    emp_user = User(
        email="emp_cancel_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Emp Cancel Test",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add_all([hr, emp_user])
    db.flush()

    emp = Employee(
        user_id=emp_user.id,
        emp_code="EMP701",
        login_id="emp.cancel",
        first_name="Emp",
        last_name="Cancel",
        email="emp_cancel_test@hrms.com",
        department="QA",
        job_position="QA Engineer"
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

def test_invalid_date_range_rejection():
    emp_token = get_token("emp_cancel_test@hrms.com")
    payload = {
        "leave_type": "Paid Time Off",
        "start_date": "2026-09-10",
        "end_date": "2026-09-05",
        "reason": "Test invalid range"
    }
    res = client.post("/api/time-off/requests", json=payload, headers={"Authorization": f"Bearer {emp_token}"})
    assert res.status_code == 400
    assert "End date cannot be earlier" in res.json()["detail"]

def test_reject_time_off_request():
    emp_token = get_token("emp_cancel_test@hrms.com")
    hr_token = get_token("hr_cancel_test@hrms.com")

    payload = {
        "leave_type": "Sick Leave",
        "start_date": date.today().isoformat(),
        "end_date": date.today().isoformat(),
        "reason": "Dental appointment"
    }
    create_res = client.post("/api/time-off/requests", json=payload, headers={"Authorization": f"Bearer {emp_token}"})
    req_id = create_res.json()["id"]

    review_res = client.put(f"/api/time-off/requests/{req_id}/review", json={"status": "REJECTED"}, headers={"Authorization": f"Bearer {hr_token}"})
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "REJECTED"
