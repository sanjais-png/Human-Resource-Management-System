import pytest
from datetime import date, datetime, timedelta
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

    user = User(
        email="overtime_tester@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Overtime Tester",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add(user)
    db.flush()

    emp = Employee(
        user_id=user.id,
        emp_code="EMP400",
        login_id="overtime.tester",
        first_name="Overtime",
        last_name="Tester",
        email="overtime_tester@hrms.com",
        department="Engineering",
        job_position="DevOps Engineer"
    )
    db.add(emp)
    db.commit()

    past_date = (date.today() - timedelta(days=5)).isoformat()
    att = Attendance(
        employee_id=emp.id,
        date=past_date,
        check_in=f"{past_date}T08:00:00",
        check_out=f"{past_date}T18:30:00",
        work_hours=10.5,
        extra_hours=2.5,
        status="Present"
    )
    db.add(att)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token():
    res = client.post("/api/auth/login", json={"email": "overtime_tester@hrms.com", "password": "pass123"})
    return res.json()["access_token"]

def test_overtime_hours_calculation():
    token = get_token()
    res = client.get("/api/attendance/history", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    records = res.json()
    assert len(records) >= 1
    assert records[0]["work_hours"] == 10.5
    assert records[0]["extra_hours"] == 2.5
