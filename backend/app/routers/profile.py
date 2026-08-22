from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Employee, UserRole
from app.schemas import EmployeeResponse, EmployeeUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Employee Profile"])

@router.get("/me", response_model=EmployeeResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        # Fallback search by email if user_id link wasn't established
        emp = db.query(Employee).filter(Employee.email == current_user.email).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found for current user"
        )
    return emp

@router.put("/me", response_model=EmployeeResponse)
def update_my_profile(
    profile_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        emp = db.query(Employee).filter(Employee.email == current_user.email).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found"
        )

    # Allowed self-service update fields for Employees
    allowed_self_fields = {
        "phone", "address", "personal_email", "skills", "resume_summary",
        "marital_status", "date_of_birth", "gender", "nationality"
    }

    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            # HR & Admin can update all fields; Employee can update self-service fields
            if current_user.role in [UserRole.ADMIN, UserRole.HR] or field in allowed_self_fields:
                setattr(emp, field, value)

    db.commit()
    db.refresh(emp)
    return emp

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_profile(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee profile with ID {employee_id} not found"
        )

    # Authorization Check: EMPLOYEE role can ONLY access their OWN profile!
    if current_user.role == UserRole.EMPLOYEE:
        own_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not own_emp or own_emp.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own profile."
            )

    return emp

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee_profile(
    employee_id: int,
    profile_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee profile with ID {employee_id} not found"
        )

    # Authorization Check
    if current_user.role == UserRole.EMPLOYEE:
        own_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not own_emp or own_emp.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only update your own profile."
            )

    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(emp, field, value)

    db.commit()
    db.refresh(emp)
    return emp
