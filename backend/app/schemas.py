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

class SignUpRequest(BaseModel):
    emp_code: Optional[str] = None
    first_name: str
    last_name: str
    email: str
    password: str
    role: UserRole = UserRole.EMPLOYEE
    department: Optional[str] = "General"
    job_position: Optional[str] = "Staff"
    otp_code: Optional[str] = None

class SendOTPRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp_code: str

class OTPResponse(BaseModel):
    message: str
    otp_code: Optional[str] = None

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
    company: str = "Dayflow Corp"
    location: str = "Headquarters"
    date_of_joining: str = "2026-01-15"
    status: str = "Absent"
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    marital_status: Optional[str] = None
    address: Optional[str] = None
    personal_email: Optional[str] = None
    pan_number: Optional[str] = None
    uan_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    skills: Optional[str] = None
    resume_summary: Optional[str] = None
    what_i_love: Optional[str] = None
    hobbies: Optional[str] = None
    certifications: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    emp_code: Optional[str] = None
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
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    skills: Optional[str] = None
    resume_summary: Optional[str] = None
    what_i_love: Optional[str] = None
    hobbies: Optional[str] = None
    certifications: Optional[str] = None

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

# Attendance Schemas
class AttendanceBase(BaseModel):
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    work_hours: float = 0.0
    extra_hours: float = 0.0
    status: str = "Present"

class AttendanceResponse(AttendanceBase):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    emp_code: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AttendanceActionRequest(BaseModel):
    date: Optional[str] = None

# Time Off Schemas
class LeaveBalanceResponse(BaseModel):
    paid_time_off: float
    sick_leave: float
    unpaid_leave: float

    model_config = ConfigDict(from_attributes=True)

class TimeOffRequestCreate(BaseModel):
    leave_type: str  # "Paid Time Off", "Sick Leave", "Unpaid Leave"
    start_date: str  # "YYYY-MM-DD"
    end_date: str    # "YYYY-MM-DD"
    reason: str

class TimeOffRequestResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: str
    end_date: str
    duration_days: float
    reason: str
    status: str
    reviewed_by: Optional[str] = None
    employee_name: Optional[str] = None
    emp_code: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TimeOffReviewRequest(BaseModel):
    status: str  # "APPROVED" or "REJECTED"
    comments: Optional[str] = None

# Salary Schemas
class SalaryComponent(BaseModel):
    name: str
    rule: str
    monthly: float
    annual: float
    formatted_monthly: str
    formatted_annual: str

class SalaryBreakdownResponse(BaseModel):
    employee_id: int
    emp_code: str
    employee_name: str
    monthly_wage: float
    annual_wage: float
    formatted_monthly_wage: str
    formatted_annual_wage: str
    components: List[SalaryComponent]
    total_deductions_monthly: float
    net_monthly_pay: float
    formatted_net_monthly_pay: str
    net_annual_pay: float
    formatted_net_annual_pay: str

class SalaryUpdateRequest(BaseModel):
    monthly_wage: float
