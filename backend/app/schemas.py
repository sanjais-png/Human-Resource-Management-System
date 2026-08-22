from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models import UserRole

class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.EMPLOYEE
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# Employee Schemas
class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: str = "General"
    job_position: str = "Staff"
    manager_name: Optional[str] = None
    company: str = "HRMS Corp"
    location: str = "Headquarters"
    date_of_joining: str = "2026-01-15"
    status: str = "Present"
    date_of_birth: Optional[str] = "1995-05-20"
    gender: Optional[str] = "Male"
    nationality: Optional[str] = "Indian"
    marital_status: Optional[str] = "Single"
    address: Optional[str] = "123 Technology Boulevard, Tech Park"
    personal_email: Optional[str] = None
    pan_number: Optional[str] = "ABCDE1234F"
    uan_number: Optional[str] = "100908070605"
    skills: Optional[str] = "Python, React, FastAPI, SQL, Tailwind CSS"
    resume_summary: Optional[str] = "Experienced professional specializing in software architecture, web development, and team collaboration."

class EmployeeCreate(EmployeeBase):
    role: UserRole = UserRole.EMPLOYEE
    create_user: bool = True
    password: Optional[str] = "emp123456"

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    job_position: Optional[str] = None
    manager_name: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    date_of_joining: Optional[str] = None
    status: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    marital_status: Optional[str] = None
    address: Optional[str] = None
    personal_email: Optional[str] = None
    pan_number: Optional[str] = None
    uan_number: Optional[str] = None
    skills: Optional[str] = None
    resume_summary: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    user_id: Optional[int] = None
    emp_code: str
    login_id: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    on_leave: int
