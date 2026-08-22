import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, Employee, UserRole, SalaryInformation
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
        email="admin_sal_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Admin Salary Test",
        role=UserRole.ADMIN,
        is_active=True
    )
    hr = User(
        email="hr_sal_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="HR Salary Test",
        role=UserRole.HR,
        is_active=True
    )
    emp_user = User(
        email="emp_sal_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Emp Salary Test",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add_all([admin, hr, emp_user])
    db.flush()

    emp = Employee(
        user_id=emp_user.id,
        emp_code="EMP601",
        login_id="emp.salary",
        first_name="Emp",
        last_name="Salary",
        email="emp_sal_test@hrms.com",
        department="Finance",
        job_position="Analyst"
    )
    db.add(emp)
    db.flush()

    sal = SalaryInformation(employee_id=emp.id, monthly_wage=100000.0)
    db.add(sal)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token(email: str):
    res = client.post("/api/auth/login", json={"email": email, "password": "pass123"})
    return res.json()["access_token"]

def test_admin_can_access_salary_breakdown():
    admin_token = get_token("admin_sal_test@hrms.com")
    all_emps = client.get("/api/employees", headers={"Authorization": f"Bearer {admin_token}"}).json()
    emp_id = [e for e in all_emps if e["email"] == "emp_sal_test@hrms.com"][0]["id"]

    res = client.get(f"/api/salary/{emp_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["monthly_wage"] == 100000.0
    assert data["annual_wage"] == 1200000.0
    # Basic Pay = 50% of 100,000 = 50,000
    basic_comp = [c for c in data["components"] if c["name"] == "Basic Pay"][0]
    assert basic_comp["monthly"] == 50000.0

def test_admin_can_update_salary():
    admin_token = get_token("admin_sal_test@hrms.com")
    all_emps = client.get("/api/employees", headers={"Authorization": f"Bearer {admin_token}"}).json()
    emp_id = [e for e in all_emps if e["email"] == "emp_sal_test@hrms.com"][0]["id"]

    update_res = client.put(f"/api/salary/{emp_id}", json={"monthly_wage": 150000.0}, headers={"Authorization": f"Bearer {admin_token}"})
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["monthly_wage"] == 150000.0
    basic_comp = [c for c in data["components"] if c["name"] == "Basic Pay"][0]
    assert basic_comp["monthly"] == 75000.0  # 50% of 150,000

def test_hr_cannot_access_salary_denied():
    hr_token = get_token("hr_sal_test@hrms.com")
    admin_token = get_token("admin_sal_test@hrms.com")
    all_emps = client.get("/api/employees", headers={"Authorization": f"Bearer {admin_token}"}).json()
    emp_id = [e for e in all_emps if e["email"] == "emp_sal_test@hrms.com"][0]["id"]

    res = client.get(f"/api/salary/{emp_id}", headers={"Authorization": f"Bearer {hr_token}"})
    assert res.status_code == 403

def test_employee_cannot_access_salary_denied():
    emp_token = get_token("emp_sal_test@hrms.com")
    admin_token = get_token("admin_sal_test@hrms.com")
    all_emps = client.get("/api/employees", headers={"Authorization": f"Bearer {admin_token}"}).json()
    emp_id = [e for e in all_emps if e["email"] == "emp_sal_test@hrms.com"][0]["id"]

    res = client.get(f"/api/salary/{emp_id}", headers={"Authorization": f"Bearer {emp_token}"})
    assert res.status_code == 403
