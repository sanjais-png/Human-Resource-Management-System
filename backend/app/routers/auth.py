import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Employee, UserRole, OTPVerification
from app.schemas import (
    Token,
    UserResponse,
    LoginRequest,
    SignUpRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    OTPResponse
)
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    require_role
)
from app.routers.employees import generate_emp_code, generate_login_id
from app.email_utils import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/send-otp", response_model=OTPResponse)
def send_otp(payload: SendOTPRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered. Please sign in.")

    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    db.query(OTPVerification).filter(OTPVerification.email == email).delete()

    otp_record = OTPVerification(
        email=email,
        otp_code=otp_code,
        is_verified=False,
        expires_at=expires_at
    )
    db.add(otp_record)
    db.commit()

    sent_successfully = send_otp_email(email, otp_code)

    return OTPResponse(
        message=f"OTP code has been sent to {email}. Valid for 10 minutes.",
        otp_code=None if sent_successfully else otp_code
    )

@router.post("/verify-otp", response_model=OTPResponse)
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    otp_code = payload.otp_code.strip()

    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.otp_code == otp_code
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please check your email.")

    if datetime.utcnow() > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new OTP.")

    otp_record.is_verified = True
    db.commit()

    return OTPResponse(message="OTP verified successfully. You can now complete your registration.")

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignUpRequest,
    db: Session = Depends(get_db)
):
    email = payload.email.strip().lower()

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )

    if payload.otp_code:
        otp_record = db.query(OTPVerification).filter(
            OTPVerification.email == email,
            OTPVerification.otp_code == payload.otp_code.strip()
        ).first()
        if not otp_record or not otp_record.is_verified:
            if otp_record and datetime.utcnow() <= otp_record.expires_at:
                otp_record.is_verified = True
                db.commit()

    emp_code = payload.emp_code.strip() if payload.emp_code else ""
    if not emp_code:
        emp_code = generate_emp_code(db, first_name=payload.first_name, last_name=payload.last_name)

    existing_emp_code = db.query(Employee).filter(Employee.emp_code == emp_code).first()
    if existing_emp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already registered."
        )

    full_name = f"{payload.first_name} {payload.last_name}"
    user = User(
        email=email,
        hashed_password=get_password_hash(payload.password),
        full_name=full_name,
        role=payload.role,
        is_active=True
    )
    db.add(user)
    db.flush()

    login_id = generate_login_id(db, payload.first_name, payload.last_name)

    employee = Employee(
        user_id=user.id,
        emp_code=emp_code,
        login_id=login_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=email,
        department=payload.department or "General",
        job_position=payload.job_position or "Staff",
        avatar_url=f"https://ui-avatars.com/api/?name={payload.first_name}+{payload.last_name}&background=6366f1&color=fff",
        status="Absent"
    )
    db.add(employee)
    db.commit()

    token_data = {"sub": user.email, "role": user.role.value, "user_id": user.id}
    access_token = create_access_token(data=token_data)

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )

    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Missing email or password.")

    identifier = payload.email.strip()
    user = db.query(User).filter(User.email == identifier).first()

    if not user:
        employee = db.query(Employee).filter(
            (Employee.login_id == identifier) | (Employee.emp_code == identifier)
        ).first()
        if employee and employee.user_id:
            user = db.query(User).filter(User.id == employee.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Login ID, email, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect Login ID, email, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    token_data = {"sub": user.email, "role": user.role.value, "user_id": user.id}
    access_token = create_access_token(data=token_data)

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )

    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.full_name}"}

@router.get("/admin-only")
def admin_only_route(current_user: User = Depends(require_role([UserRole.ADMIN]))):
    return {"message": "Admin access granted"}
