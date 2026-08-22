import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    emp_code = Column(String, unique=True, index=True, nullable=False)
    login_id = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=False, default="General")
    job_position = Column(String, nullable=False, default="Staff")
    manager_name = Column(String, nullable=True)
    company = Column(String, nullable=False, default="HRMS Corp")
    location = Column(String, nullable=False, default="Headquarters")
    date_of_joining = Column(String, nullable=False, default="2026-01-15")
    avatar_url = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Present")

    date_of_birth = Column(String, nullable=True, default="1995-05-20")
    gender = Column(String, nullable=True, default="Male")
    nationality = Column(String, nullable=True, default="Indian")
    marital_status = Column(String, nullable=True, default="Single")
    address = Column(String, nullable=True, default="123 Technology Boulevard, Tech Park")
    personal_email = Column(String, nullable=True)
    pan_number = Column(String, nullable=True, default="ABCDE1234F")
    uan_number = Column(String, nullable=True, default="100908070605")

    skills = Column(String, nullable=True, default="Python, React, FastAPI, SQL, Tailwind CSS")
    resume_summary = Column(Text, nullable=True, default="Experienced professional specializing in software architecture, web development, and team collaboration.")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="employee")
    attendances = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_balance = relationship("LeaveBalance", back_populates="employee", uselist=False, cascade="all, delete-orphan")
    time_off_requests = relationship("TimeOffRequest", back_populates="employee", cascade="all, delete-orphan")
    salary_info = relationship("SalaryInformation", back_populates="employee", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Employee {self.emp_code}: {self.first_name} {self.last_name}>"

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(String, nullable=False, index=True)
    check_in = Column(String, nullable=True)
    check_out = Column(String, nullable=True)
    work_hours = Column(Float, default=0.0, nullable=False)
    extra_hours = Column(Float, default=0.0, nullable=False)
    status = Column(String, default="Present", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="attendances")

    __table_args__ = (
        UniqueConstraint('employee_id', 'date', name='_emp_date_uc'),
    )

class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False, index=True)
    paid_time_off = Column(Float, default=24.0, nullable=False)
    sick_leave = Column(Float, default=7.0, nullable=False)
    unpaid_leave = Column(Float, default=0.0, nullable=False)

    employee = relationship("Employee", back_populates="leave_balance")

class TimeOffRequest(Base):
    __tablename__ = "time_off_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(String, nullable=False)  # Paid Time Off, Sick Leave, Unpaid Leave
    start_date = Column(String, nullable=False)  # YYYY-MM-DD
    end_date = Column(String, nullable=False)    # YYYY-MM-DD
    duration_days = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
    reviewed_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="time_off_requests")

class SalaryInformation(Base):
    __tablename__ = "salary_informations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False, index=True)
    monthly_wage = Column(Float, default=100000.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="salary_info")
