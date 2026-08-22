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
