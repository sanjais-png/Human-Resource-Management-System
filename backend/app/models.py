import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
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
    status = Column(String, nullable=False, default="Present")  # Present, Absent, Leave

    # Private & Personal Profile Information
    date_of_birth = Column(String, nullable=True, default="1995-05-20")
    gender = Column(String, nullable=True, default="Male")
    nationality = Column(String, nullable=True, default="Indian")
    marital_status = Column(String, nullable=True, default="Single")
    address = Column(String, nullable=True, default="123 Technology Boulevard, Tech Park")
    personal_email = Column(String, nullable=True)
    pan_number = Column(String, nullable=True, default="ABCDE1234F")
    uan_number = Column(String, nullable=True, default="100908070605")

    # Skills & Resume Summary
    skills = Column(String, nullable=True, default="Python, React, FastAPI, SQL, Tailwind CSS")
    resume_summary = Column(Text, nullable=True, default="Experienced professional specializing in software architecture, web development, and team collaboration.")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="employee")

    def __repr__(self):
        return f"<Employee {self.emp_code}: {self.first_name} {self.last_name}>"
