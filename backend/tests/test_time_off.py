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
        email="hr_leave_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="HR Leave Test",
        role=UserRole.HR,
        is_active=True
    )
    emp_user = User(
        email="emp_leave_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Emp Leave Test",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add_all([hr, emp_user])
    db.flush()

    emp = Employee(
        user_id=emp_user.id,
        emp_code="EMP501",
        login_id="emp.leave",
        first_name="Emp",
        last_name="Leave",
        email="emp_leave_test@hrms.com",
        department="Engineering",
        job_position="Developer",
        status="Present"
    )
    db.add(emp)
    db.flush()

    bal = LeaveBalance(employee_id=emp.id, paid_time_off=24.0, sick_leave=7.0, unpaid_leave=0.0)
    db.add(bal)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token(email: str):
    res = client.post("/api/auth/login", json={"email": email, "password": "pass123"})
    return res.json()["access_token"]

def test_get_leave_balance():
    token = get_token("emp_leave_test@hrms.com")
    res = client.get("/api/time-off/balance", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["paid_time_off"] == 24.0
    assert data["sick_leave"] == 7.0

def test_create_and_approve_time_off_request():
    emp_token = get_token("emp_leave_test@hrms.com")
    hr_token = get_token("hr_leave_test@hrms.com")

    start_str = date.today().isoformat()
    end_str = (date.today() + timedelta(days=2)).isoformat()  # 3 days duration

    # 1. Employee creates request
    payload = {
        "leave_type": "Paid Time Off",
        "start_date": start_str,
        "end_date": end_str,
        "reason": "Family vacation"
    }
    create_res = client.post("/api/time-off/requests", json=payload, headers={"Authorization": f"Bearer {emp_token}"})
    assert create_res.status_code == 201
    req_id = create_res.json()["id"]
    assert create_res.json()["duration_days"] == 3.0
    assert create_res.json()["status"] == "PENDING"

    # 2. Employee attempts review -> 403 Forbidden!
    emp_review_res = client.put(f"/api/time-off/requests/{req_id}/review", json={"status": "APPROVED"}, headers={"Authorization": f"Bearer {emp_token}"})
    assert emp_review_res.status_code == 403

    # 3. HR approves request -> Success & balance deducted (24.0 - 3.0 = 21.0)
    hr_review_res = client.put(f"/api/time-off/requests/{req_id}/review", json={"status": "APPROVED"}, headers={"Authorization": f"Bearer {hr_token}"})
    assert hr_review_res.status_code == 200
    assert hr_review_res.json()["status"] == "APPROVED"

    # Verify balance deduction
    bal_res = client.get("/api/time-off/balance", headers={"Authorization": f"Bearer {emp_token}"})
    assert bal_res.json()["paid_time_off"] == 21.0
