import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models import User, Employee, UserRole
from app.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    DashboardStats
)
from app.auth import get_current_user, require_role, get_password_hash

router = APIRouter(prefix="/api", tags=["Employee Management"])

def generate_emp_code(db: Session) -> str:
    count = db.query(Employee).count()
    new_num = count + 1
    code = f"EMP{new_num:03d}"
    while db.query(Employee).filter(Employee.emp_code == code).first():
        new_num += 1
        code = f"EMP{new_num:03d}"
    return code

def generate_login_id(db: Session, first_name: str, last_name: str) -> str:
    clean_first = re.sub(r'[^a-zA-Z0-9]', '', first_name.strip().lower())
    clean_last = re.sub(r'[^a-zA-Z0-9]', '', last_name.strip().lower())
    base_id = f"{clean_first}.{clean_last}"
    
    login_id = base_id
    counter = 1
    while db.query(Employee).filter(Employee.login_id == login_id).first():
        counter += 1
        login_id = f"{base_id}{counter}"
    return login_id

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(Employee).count()
    present = db.query(Employee).filter(Employee.status == "Present").count()
    absent = db.query(Employee).filter(Employee.status == "Absent").count()
    on_leave = db.query(Employee).filter(Employee.status == "Leave").count()
    return DashboardStats(
        total_employees=total,
        present_today=present,
        absent_today=absent,
        on_leave=on_leave
    )

@router.get("/employees", response_model=List[EmployeeResponse])
def list_employees(
    query: Optional[str] = Query(None, description="Search by name, email, department, position, code"),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Employee)
    if department and department != "All":
        q = q.filter(Employee.department == department)
    if query:
        search_term = f"%{query}%"
        q = q.filter(
            or_(
                Employee.first_name.ilike(search_term),
                Employee.last_name.ilike(search_term),
                Employee.email.ilike(search_term),
                Employee.emp_code.ilike(search_term),
                Employee.department.ilike(search_term),
                Employee.job_position.ilike(search_term)
            )
        )
    return q.order_by(Employee.id.desc()).all()

@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    return emp

@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.HR]))
):
    existing_emp = db.query(Employee).filter(Employee.email == emp_data.email).first()
    if existing_emp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee with email '{emp_data.email}' already exists"
        )

    emp_code = generate_emp_code(db)
    login_id = generate_login_id(db, emp_data.first_name, emp_data.last_name)

    created_user_id = None
    if emp_data.create_user:
        existing_user = db.query(User).filter(User.email == emp_data.email).first()
        if not existing_user:
            new_user = User(
                email=emp_data.email,
                hashed_password=get_password_hash(emp_data.password or "emp123456"),
                full_name=f"{emp_data.first_name} {emp_data.last_name}",
                role=emp_data.role,
                is_active=True
            )
            db.add(new_user)
            db.flush()
            created_user_id = new_user.id
        else:
            created_user_id = existing_user.id

    avatar_url = f"https://ui-avatars.com/api/?name={emp_data.first_name}+{emp_data.last_name}&background=6366f1&color=fff"

    new_emp = Employee(
        user_id=created_user_id,
        emp_code=emp_code,
        login_id=login_id,
        first_name=emp_data.first_name,
        last_name=emp_data.last_name,
        email=emp_data.email,
        phone=emp_data.phone,
        department=emp_data.department,
        job_position=emp_data.job_position,
        manager_name=emp_data.manager_name,
        company=emp_data.company,
        location=emp_data.location,
        date_of_joining=emp_data.date_of_joining,
        avatar_url=avatar_url,
        status=emp_data.status
    )

    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    emp_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.HR]))
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )

    update_data = emp_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(emp, field, value)

    if emp.user_id:
        user = db.query(User).filter(User.id == emp.user_id).first()
        if user:
            if "first_name" in update_data or "last_name" in update_data:
                user.full_name = f"{emp.first_name} {emp.last_name}"
            if "email" in update_data and update_data["email"]:
                user.email = emp.email

    db.commit()
    db.refresh(emp)
    return emp
