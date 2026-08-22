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

    admin = User(
        email="admin_emp_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True
    )
    hr = User(
        email="hr_emp_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="HR User",
        role=UserRole.HR,
        is_active=True
    )
    emp_user = User(
        email="regular_emp_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Regular Employee",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add_all([admin, hr, emp_user])
    db.flush()

    emp1 = Employee(
        user_id=emp_user.id,
        emp_code="EMP001",
        login_id="regular.employee",
        first_name="Regular",
        last_name="Employee",
        email="regular_emp_test@hrms.com",
        phone="+1 555-0001",
        department="Engineering",
        job_position="Developer",
        company="HRMS Corp",
        location="Headquarters",
        date_of_joining="2026-01-01",
        status="Present"
    )
    db.add(emp1)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token(email: str):
    res = client.post("/api/auth/login", json={"email": email, "password": "pass123"})
    return res.json()["access_token"]

def test_list_and_search_employees():
    token = get_token("regular_emp_test@hrms.com")
    res = client.get("/api/employees", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1

    res_search = client.get("/api/employees?query=Engineering", headers={"Authorization": f"Bearer {token}"})
    assert res_search.status_code == 200
    assert any(e["department"] == "Engineering" for e in res_search.json())

def test_admin_and_hr_can_create_employee():
    admin_token = get_token("admin_emp_test@hrms.com")
    new_emp_payload = {
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice.smith@hrms.com",
        "phone": "+1 555-0099",
        "department": "Finance",
        "job_position": "Financial Analyst",
        "company": "HRMS Corp",
        "location": "Headquarters",
        "date_of_joining": "2026-02-01",
        "status": "Present",
        "role": "EMPLOYEE",
        "create_user": True,
        "password": "emp123456"
    }

    res = client.post("/api/employees", json=new_emp_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["first_name"] == "Alice"
    assert "ALSM" in data["emp_code"]
    assert len(data["emp_code"]) >= 12

def test_employee_cannot_create_employee():
    emp_token = get_token("regular_emp_test@hrms.com")
    new_emp_payload = {
        "first_name": "Bob",
        "last_name": "Jones",
        "email": "bob.jones@hrms.com",
        "department": "Sales",
        "job_position": "Sales Rep"
    }

    res = client.post("/api/employees", json=new_emp_payload, headers={"Authorization": f"Bearer {emp_token}"})
    assert res.status_code == 403

def test_dashboard_stats():
    token = get_token("admin_emp_test@hrms.com")
    res = client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total_employees" in data
    assert "present_today" in data
    assert data["total_employees"] >= 1
