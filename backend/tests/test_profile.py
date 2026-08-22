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
        email="admin_prof_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Admin Profile Test",
        role=UserRole.ADMIN,
        is_active=True
    )
    emp1_user = User(
        email="emp1_prof_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Emp One Test",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    emp2_user = User(
        email="emp2_prof_test@hrms.com",
        hashed_password=get_password_hash("pass123"),
        full_name="Emp Two Test",
        role=UserRole.EMPLOYEE,
        is_active=True
    )
    db.add_all([admin, emp1_user, emp2_user])
    db.flush()

    emp1 = Employee(
        user_id=emp1_user.id,
        emp_code="EMP101",
        login_id="emp.one",
        first_name="Emp",
        last_name="One",
        email="emp1_prof_test@hrms.com",
        department="Engineering",
        job_position="Backend Lead",
        skills="Python, SQL"
    )
    emp2 = Employee(
        user_id=emp2_user.id,
        emp_code="EMP102",
        login_id="emp.two",
        first_name="Emp",
        last_name="Two",
        email="emp2_prof_test@hrms.com",
        department="Design",
        job_position="UX Designer",
        skills="Figma, UI"
    )
    db.add_all([emp1, emp2])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def get_token(email: str):
    res = client.post("/api/auth/login", json={"email": email, "password": "pass123"})
    return res.json()["access_token"]

def test_get_my_profile():
    token = get_token("emp1_prof_test@hrms.com")
    res = client.get("/api/profile/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "emp1_prof_test@hrms.com"
    assert data["emp_code"] == "EMP101"

def test_update_my_profile_skills():
    token = get_token("emp1_prof_test@hrms.com")
    update_payload = {
        "skills": "Python, FastAPI, React, Docker",
        "resume_summary": "Building scalable web apps for HRMS."
    }
    res = client.put("/api/profile/me", json=update_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "FastAPI" in data["skills"]
    assert "scalable web apps" in data["resume_summary"]

def test_employee_cannot_view_other_employee_profile():
    emp1_token = get_token("emp1_prof_test@hrms.com")
    admin_token = get_token("admin_prof_test@hrms.com")
    
    all_emps = client.get("/api/employees", headers={"Authorization": f"Bearer {admin_token}"}).json()
    emp2 = [e for e in all_emps if e["email"] == "emp2_prof_test@hrms.com"][0]

    # Emp1 attempting to view Emp2 profile must return 403 Forbidden!
    res = client.get(f"/api/profile/{emp2['id']}", headers={"Authorization": f"Bearer {emp1_token}"})
    assert res.status_code == 403

def test_admin_can_view_any_employee_profile():
    admin_token = get_token("admin_prof_test@hrms.com")
    all_emps = client.get("/api/employees", headers={"Authorization": f"Bearer {admin_token}"}).json()
    emp1 = [e for e in all_emps if e["email"] == "emp1_prof_test@hrms.com"][0]

    res = client.get(f"/api/profile/{emp1['id']}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.json()["id"] == emp1["id"]
