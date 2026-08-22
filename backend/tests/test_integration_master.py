import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, Employee, UserRole, Attendance, LeaveBalance, TimeOffRequest, SalaryInformation
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
        email="master_admin@hrms.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Master Admin",
        role=UserRole.ADMIN,
        is_active=True
    )
    hr = User(
        email="master_hr@hrms.com",
        hashed_password=get_password_hash("hr123456"),
        full_name="Master HR",
        role=UserRole.HR,
        is_active=True
    )
    emp_user = User(
        email="master_emp@hrms.com",
        hashed_password=get_password_hash("emp123456"),
        full_name="Master Employee",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add_all([admin, hr, emp_user])
    db.flush()

    emp_admin = Employee(
        user_id=admin.id,
        emp_code="EMP001",
        login_id="master.admin",
        first_name="Master",
        last_name="Admin",
        email="master_admin@hrms.com",
        department="Executive",
        job_position="CEO"
    )
    emp_hr = Employee(
        user_id=hr.id,
        emp_code="EMP002",
        login_id="master.hr",
        first_name="Master",
        last_name="HR",
        email="master_hr@hrms.com",
        department="HR",
        job_position="HR Manager"
    )
    emp = Employee(
        user_id=emp_user.id,
        emp_code="EMP003",
        login_id="master.emp",
        first_name="Master",
        last_name="Employee",
        email="master_emp@hrms.com",
        department="Engineering",
        job_position="Senior Engineer"
    )
    db.add_all([emp_admin, emp_hr, emp])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token(email: str, password: str):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]

def test_workflow_admin_complete_pass():
    # 1. ADMIN Login
    token = get_token("master_admin@hrms.com", "admin123")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. View Dashboard Stats
    dash_res = client.get("/api/dashboard/stats", headers=headers)
    assert dash_res.status_code == 200

    # 3. Create Employee
    new_emp_payload = {
        "first_name": "Integration",
        "last_name": "Tester",
        "email": "integration.test@hrms.com",
        "department": "Engineering",
        "job_position": "QA Lead",
        "role": "EMPLOYEE"
    }
    create_res = client.post("/api/employees", json=new_emp_payload, headers=headers)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    # 4. View Profile
    prof_res = client.get(f"/api/profile/{created_id}", headers=headers)
    assert prof_res.status_code == 200

    # 5. View & Update Salary
    sal_res = client.get(f"/api/salary/{created_id}", headers=headers)
    assert sal_res.status_code == 200
    sal_update = client.put(f"/api/salary/{created_id}", json={"monthly_wage": 120000.0}, headers=headers)
    assert sal_update.status_code == 200
    assert sal_update.json()["monthly_wage"] == 120000.0

def test_workflow_hr_complete_pass():
    # 1. HR Login
    hr_token = get_token("master_hr@hrms.com", "hr123456")
    headers = {"Authorization": f"Bearer {hr_token}"}

    # 2. Employees List
    emps_res = client.get("/api/employees", headers=headers)
    assert emps_res.status_code == 200
    target_emp_id = emps_res.json()[0]["id"]

    # 3. Attendance Admin All
    att_res = client.get("/api/attendance/admin/all", headers=headers)
    assert att_res.status_code == 200

    # 4. Time Off Request & Review
    emp_token = get_token("master_emp@hrms.com", "emp123456")
    to_req = client.post("/api/time-off/requests", json={
        "leave_type": "Paid Time Off",
        "start_date": date.today().isoformat(),
        "end_date": date.today().isoformat(),
        "reason": "Integration Test Leave"
    }, headers={"Authorization": f"Bearer {emp_token}"})
    req_id = to_req.json()["id"]

    approve_res = client.put(f"/api/time-off/requests/{req_id}/review", json={"status": "APPROVED"}, headers=headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 5. Salary Access Denied for HR
    sal_denied = client.get(f"/api/salary/{target_emp_id}", headers=headers)
    assert sal_denied.status_code == 403

def test_workflow_employee_complete_pass():
    # 1. Employee Login
    token = get_token("master_emp@hrms.com", "emp123456")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. View My Profile
    prof_res = client.get("/api/profile/me", headers=headers)
    assert prof_res.status_code == 200

    # 3. Check In & Check Out
    check_in = client.post("/api/attendance/check-in", json={}, headers=headers)
    assert check_in.status_code == 200
    check_out = client.post("/api/attendance/check-out", json={}, headers=headers)
    assert check_out.status_code == 200

    # 4. View Attendance History
    hist_res = client.get("/api/attendance/history", headers=headers)
    assert hist_res.status_code == 200

    # 5. Salary Access Denied for Employee
    sal_denied = client.get("/api/salary/1", headers=headers)
    assert sal_denied.status_code == 403
