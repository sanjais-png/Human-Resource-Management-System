from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.database import get_db
from app.models import User, Employee, Attendance, UserRole
from app.schemas import AttendanceResponse, AttendanceActionRequest
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/attendance", tags=["Attendance Management"])

def get_employee_for_user(db: Session, user: User) -> Employee:
    emp = db.query(Employee).filter(Employee.user_id == user.id).first()
    if not emp:
        emp = db.query(Employee).filter(Employee.email == user.email).first()
    if not emp:
        name_parts = (user.full_name or "New User").split(" ", 1)
        fname = name_parts[0]
        lname = name_parts[1] if len(name_parts) > 1 else ""
        emp_code = f"EMP{user.id:04d}"
        login_id = user.email.split("@")[0]
        emp = Employee(
            user_id=user.id,
            emp_code=emp_code,
            login_id=login_id,
            first_name=fname,
            last_name=lname,
            email=user.email,
            department="Engineering",
            job_position="Employee",
            status="Absent"
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)
    return emp

def build_attendance_response(att: Attendance) -> AttendanceResponse:
    emp_name = f"{att.employee.first_name} {att.employee.last_name}" if att.employee else "Unknown"
    emp_code = att.employee.emp_code if att.employee else "N/A"
    dept = att.employee.department if att.employee else "N/A"
    
    return AttendanceResponse(
        id=att.id,
        employee_id=att.employee_id,
        date=att.date,
        check_in=att.check_in,
        check_out=att.check_out,
        work_hours=round(att.work_hours, 2),
        extra_hours=round(att.extra_hours, 2),
        status=att.status,
        employee_name=emp_name,
        emp_code=emp_code,
        department=dept,
        created_at=att.created_at
    )

@router.post("/check-in", response_model=AttendanceResponse)
def check_in(
    payload: Optional[AttendanceActionRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = get_employee_for_user(db, current_user)
    today_str = (payload.date if payload and payload.date else date.today().isoformat())
    now_iso = datetime.now().isoformat()

    existing = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.date == today_str
    ).first()

    if existing and existing.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Already checked in for {today_str} at {existing.check_in[:19].replace('T', ' ')}"
        )

    if not existing:
        existing = Attendance(
            employee_id=emp.id,
            date=today_str,
            check_in=now_iso,
            status="Present"
        )
        db.add(existing)
    else:
        existing.check_in = now_iso
        existing.status = "Present"

    # Sync Employee current status
    emp.status = "Present"

    db.commit()
    db.refresh(existing)
    return build_attendance_response(existing)

@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    payload: Optional[AttendanceActionRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = get_employee_for_user(db, current_user)
    today_str = (payload.date if payload and payload.date else date.today().isoformat())
    now_iso = datetime.now().isoformat()

    existing = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.date == today_str
    ).first()

    if not existing or not existing.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Check-out requires an active check-in for {today_str}"
        )

    if existing.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Already checked out for {today_str} at {existing.check_out[:19].replace('T', ' ')}"
        )

    existing.check_out = now_iso

    try:
        in_time = datetime.fromisoformat(existing.check_in)
        out_time = datetime.fromisoformat(now_iso)
        duration_hours = (out_time - in_time).total_seconds() / 3600.0
        existing.work_hours = max(duration_hours, 0.0)
        existing.extra_hours = max(existing.work_hours - 8.0, 0.0)
    except Exception:
        existing.work_hours = 8.0
        existing.extra_hours = 0.0

    db.commit()
    db.refresh(existing)
    return build_attendance_response(existing)

@router.get("/today", response_model=Optional[AttendanceResponse])
def get_today_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = get_employee_for_user(db, current_user)
    today_str = date.today().isoformat()
    att = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.date == today_str
    ).first()
    if not att:
        return None
    return build_attendance_response(att)

@router.get("/my-history", response_model=List[AttendanceResponse])
@router.get("/history", response_model=List[AttendanceResponse])
def get_attendance_history(
    employee_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.EMPLOYEE:
        emp = get_employee_for_user(db, current_user)
        target_emp_id = emp.id
    else:
        if employee_id:
            target_emp_id = employee_id
        else:
            emp = get_employee_for_user(db, current_user)
            target_emp_id = emp.id

    records = db.query(Attendance).filter(
        Attendance.employee_id == target_emp_id
    ).order_by(desc(Attendance.date)).all()

    return [build_attendance_response(att) for att in records]

@router.get("/all", response_model=List[AttendanceResponse])
@router.get("/admin/all", response_model=List[AttendanceResponse])
def get_all_attendance(
    search: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.HR]))
):
    q = db.query(Attendance).join(Employee)
    target_date = date or date_filter
    if target_date:
        q = q.filter(Attendance.date == target_date)
    if search:
        search_term = f"%{search}%"
        q = q.filter(
            or_(
                Employee.first_name.ilike(search_term),
                Employee.last_name.ilike(search_term),
                Employee.emp_code.ilike(search_term),
                Employee.department.ilike(search_term)
            )
        )
    records = q.order_by(desc(Attendance.date), desc(Attendance.id)).all()
    return [build_attendance_response(att) for att in records]
