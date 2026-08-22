import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum as SQLEnum, ForeignKey, Text
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
    role = Column(SQLEnum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)

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
    company = Column(String, nullable=False, default="Dayflow Corp")
    location = Column(String, nullable=False, default="Headquarters")
    date_of_joining = Column(String, nullable=False, default="2026-01-15")
    avatar_url = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Present")

    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    address = Column(String, nullable=True)
    personal_email = Column(String, nullable=True)
    pan_number = Column(String, nullable=True)
    uan_number = Column(String, nullable=True)

    # Bank details (no hardcoded column defaults)
    bank_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)

    # Bio & resume details (no hardcoded column defaults)
    skills = Column(String, nullable=True)
    resume_summary = Column(Text, nullable=True)
    what_i_love = Column(Text, nullable=True)
    hobbies = Column(Text, nullable=True)
    certifications = Column(String, nullable=True)

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
    date = Column(String, nullable=False)  # "YYYY-MM-DD"
    check_in = Column(String, nullable=True)
    check_out = Column(String, nullable=True)
    work_hours = Column(Float, default=0.0)
    extra_hours = Column(Float, default=0.0)
    status = Column(String, default="Present")  # "Present", "Absent", "Half-day", "Leave"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="attendances")

class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    paid_time_off = Column(Float, default=20.0)
    sick_leave = Column(Float, default=10.0)
    unpaid_leave = Column(Float, default=30.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="leave_balance")

class TimeOffRequest(Base):
    __tablename__ = "time_off_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(String, nullable=False)  # "Paid Time Off", "Sick Leave", "Unpaid Leave"
    start_date = Column(String, nullable=False)  # "YYYY-MM-DD"
    end_date = Column(String, nullable=False)    # "YYYY-MM-DD"
    duration_days = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="PENDING")   # "PENDING", "APPROVED", "REJECTED"
    reviewed_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", back_populates="time_off_requests")

class SalaryInformation(Base):
    __tablename__ = "salary_informations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    monthly_wage = Column(Float, nullable=False, default=50000.0)
    currency = Column(String, default="INR")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="salary_info")
