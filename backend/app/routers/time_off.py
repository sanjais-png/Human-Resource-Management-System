from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import User, Employee, LeaveBalance, TimeOffRequest, Attendance, UserRole
from app.schemas import (
    LeaveBalanceResponse,
    TimeOffRequestCreate,
    TimeOffRequestResponse,
    TimeOffReviewRequest
)
from app.auth import get_current_user, require_role
from app.routers.attendance import get_employee_for_user

router = APIRouter(prefix="/api/time-off", tags=["Time Off Management"])

def get_or_create_leave_balance(db: Session, employee_id: int) -> LeaveBalance:
    bal = db.query(LeaveBalance).filter(LeaveBalance.employee_id == employee_id).first()
    if not bal:
        bal = LeaveBalance(employee_id=employee_id, paid_time_off=24.0, sick_leave=7.0, unpaid_leave=0.0)
        db.add(bal)
        db.commit()
        db.refresh(bal)
    return bal

def build_request_response(req: TimeOffRequest) -> TimeOffRequestResponse:
    emp_name = f"{req.employee.first_name} {req.employee.last_name}" if req.employee else "Unknown"
    emp_code = req.employee.emp_code if req.employee else "N/A"
    dept = req.employee.department if req.employee else "N/A"
    return TimeOffRequestResponse(
        id=req.id,
        employee_id=req.employee_id,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        duration_days=req.duration_days,
        reason=req.reason,
        status=req.status,
        reviewed_by=req.reviewed_by,
        employee_name=emp_name,
        emp_code=emp_code,
        department=dept,
        created_at=req.created_at
    )

@router.get("/balance", response_model=LeaveBalanceResponse)
def get_my_leave_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = get_employee_for_user(db, current_user)
    bal = get_or_create_leave_balance(db, emp.id)
    return bal

@router.post("/requests", response_model=TimeOffRequestResponse, status_code=status.HTTP_201_CREATED)
def create_time_off_request(
    req_data: TimeOffRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = get_employee_for_user(db, current_user)
    bal = get_or_create_leave_balance(db, emp.id)

    try:
        start_dt = date.fromisoformat(req_data.start_date)
        end_dt = date.fromisoformat(req_data.end_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    if end_dt < start_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be earlier than start date"
        )

    duration = float((end_dt - start_dt).days + 1)

    # Check balance if Paid Time Off or Sick Leave
    if req_data.leave_type == "Paid Time Off" and bal.paid_time_off < duration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient Paid Time Off balance. Required: {duration} days, Available: {bal.paid_time_off} days"
        )
    elif req_data.leave_type == "Sick Leave" and bal.sick_leave < duration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient Sick Leave balance. Required: {duration} days, Available: {bal.sick_leave} days"
        )

    new_req = TimeOffRequest(
        employee_id=emp.id,
        leave_type=req_data.leave_type,
        start_date=req_data.start_date,
        end_date=req_data.end_date,
        duration_days=duration,
        reason=req_data.reason,
        status="PENDING"
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return build_request_response(new_req)

@router.get("/requests", response_model=List[TimeOffRequestResponse])
def get_time_off_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.EMPLOYEE:
        emp = get_employee_for_user(db, current_user)
        requests = db.query(TimeOffRequest).filter(
            TimeOffRequest.employee_id == emp.id
        ).order_by(desc(TimeOffRequest.id)).all()
    else:
        requests = db.query(TimeOffRequest).order_by(desc(TimeOffRequest.id)).all()

    return [build_request_response(r) for r in requests]

@router.put("/requests/{request_id}/review", response_model=TimeOffRequestResponse)
def review_time_off_request(
    request_id: int,
    review_data: TimeOffReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.HR]))
):
    req = db.query(TimeOffRequest).filter(TimeOffRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Time Off request #{request_id} not found"
        )

    if review_data.status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'APPROVED' or 'REJECTED'"
        )

    req.status = review_data.status
    req.reviewed_by = current_user.full_name

    if review_data.status == "APPROVED":
        # Deduct leave balance
        bal = get_or_create_leave_balance(db, req.employee_id)
        if req.leave_type == "Paid Time Off":
            bal.paid_time_off = max(bal.paid_time_off - req.duration_days, 0.0)
        elif req.leave_type == "Sick Leave":
            bal.sick_leave = max(bal.sick_leave - req.duration_days, 0.0)
        else:
            bal.unpaid_leave += req.duration_days

        # Reflect in Attendance table for each date in range
        try:
            start_dt = date.fromisoformat(req.start_date)
            end_dt = date.fromisoformat(req.end_date)
            curr = start_dt
            today_dt = date.today()

            while curr <= end_dt:
                curr_str = curr.isoformat()
                att = db.query(Attendance).filter(
                    Attendance.employee_id == req.employee_id,
                    Attendance.date == curr_str
                ).first()
                if not att:
                    att = Attendance(
                        employee_id=req.employee_id,
                        date=curr_str,
                        status="Leave"
                    )
                    db.add(att)
                else:
                    att.status = "Leave"

                if curr == today_dt:
                    req.employee.status = "On Leave"

                curr += timedelta(days=1)
        except Exception as e:
            print("Error creating leave attendance records:", e)

    db.commit()
    db.refresh(req)
    return build_request_response(req)
