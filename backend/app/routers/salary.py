from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Employee, SalaryInformation, UserRole
from app.schemas import SalaryBreakdownResponse, SalaryComponent, SalaryUpdateRequest
from app.auth import require_role

router = APIRouter(prefix="/api/salary", tags=["Salary Information (ADMIN ONLY)"])

def format_inr(amount: float) -> str:
    return f"₹{amount:,.2f}"

def calculate_salary_breakdown(emp: Employee, monthly_wage: float) -> SalaryBreakdownResponse:
    # Dynamic calculation service (NO hardcoded totals!)
    annual_wage = monthly_wage * 12.0

    basic_m = monthly_wage * 0.50
    basic_a = basic_m * 12.0

    hra_m = basic_m * 0.50
    hra_a = hra_m * 12.0

    std_allowance_m = 4167.0  # ₹50,000 / year
    std_allowance_a = 50000.0

    perf_bonus_m = basic_m * 0.10
    perf_bonus_a = perf_bonus_m * 12.0

    lta_m = basic_m * 0.05
    lta_a = lta_m * 12.0

    allocated_m = basic_m + hra_m + std_allowance_m + perf_bonus_m + lta_m
    fixed_allowance_m = max(monthly_wage - allocated_m, 0.0)
    fixed_allowance_a = fixed_allowance_m * 12.0

    # Deductions
    pf_m = basic_m * 0.12
    pf_a = pf_m * 12.0

    prof_tax_m = 200.0
    prof_tax_a = prof_tax_m * 12.0

    total_deductions_m = pf_m + prof_tax_m
    net_monthly_pay = max(monthly_wage - total_deductions_m, 0.0)
    net_annual_pay = net_monthly_pay * 12.0

    components = [
        SalaryComponent(
            name="Basic Pay",
            rule="50% of Monthly Wage",
            monthly=round(basic_m, 2),
            annual=round(basic_a, 2),
            formatted_monthly=format_inr(basic_m),
            formatted_annual=format_inr(basic_a)
        ),
        SalaryComponent(
            name="House Rent Allowance (HRA)",
            rule="50% of Basic Pay",
            monthly=round(hra_m, 2),
            annual=round(hra_a, 2),
            formatted_monthly=format_inr(hra_m),
            formatted_annual=format_inr(hra_a)
        ),
        SalaryComponent(
            name="Standard Allowance",
            rule="Fixed Statutory Amount",
            monthly=round(std_allowance_m, 2),
            annual=round(std_allowance_a, 2),
            formatted_monthly=format_inr(std_allowance_m),
            formatted_annual=format_inr(std_allowance_a)
        ),
        SalaryComponent(
            name="Performance Bonus",
            rule="10% of Basic Pay",
            monthly=round(perf_bonus_m, 2),
            annual=round(perf_bonus_a, 2),
            formatted_monthly=format_inr(perf_bonus_m),
            formatted_annual=format_inr(perf_bonus_a)
        ),
        SalaryComponent(
            name="Leave Travel Allowance (LTA)",
            rule="5% of Basic Pay",
            monthly=round(lta_m, 2),
            annual=round(lta_a, 2),
            formatted_monthly=format_inr(lta_m),
            formatted_annual=format_inr(lta_a)
        ),
        SalaryComponent(
            name="Fixed Special Allowance",
            rule="Remaining Wage Balance",
            monthly=round(fixed_allowance_m, 2),
            annual=round(fixed_allowance_a, 2),
            formatted_monthly=format_inr(fixed_allowance_m),
            formatted_annual=format_inr(fixed_allowance_a)
        ),
        SalaryComponent(
            name="Provident Fund (PF Deduction)",
            rule="12% of Basic Pay (Deduction)",
            monthly=round(pf_m, 2),
            annual=round(pf_a, 2),
            formatted_monthly=f"-{format_inr(pf_m)}",
            formatted_annual=f"-{format_inr(pf_a)}"
        ),
        SalaryComponent(
            name="Professional Tax (Statutory Deduction)",
            rule="Fixed Statutory Deduction",
            monthly=round(prof_tax_m, 2),
            annual=round(prof_tax_a, 2),
            formatted_monthly=f"-{format_inr(prof_tax_m)}",
            formatted_annual=f"-{format_inr(prof_tax_a)}"
        ),
    ]

    emp_name = f"{emp.first_name} {emp.last_name}"

    return SalaryBreakdownResponse(
        employee_id=emp.id,
        emp_code=emp.emp_code,
        employee_name=emp_name,
        monthly_wage=round(monthly_wage, 2),
        annual_wage=round(annual_wage, 2),
        formatted_monthly_wage=format_inr(monthly_wage),
        formatted_annual_wage=format_inr(annual_wage),
        components=components,
        total_deductions_monthly=round(total_deductions_m, 2),
        net_monthly_pay=round(net_monthly_pay, 2),
        formatted_net_monthly_pay=format_inr(net_monthly_pay),
        net_annual_pay=round(net_annual_pay, 2),
        formatted_net_annual_pay=format_inr(net_annual_pay)
    )

@router.get("/{employee_id}", response_model=SalaryBreakdownResponse)
def get_employee_salary_info(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee #{employee_id} not found"
        )

    sal = db.query(SalaryInformation).filter(SalaryInformation.employee_id == employee_id).first()
    if not sal:
        sal = SalaryInformation(employee_id=employee_id, monthly_wage=100000.0)
        db.add(sal)
        db.commit()
        db.refresh(sal)

    return calculate_salary_breakdown(emp, sal.monthly_wage)

@router.put("/{employee_id}", response_model=SalaryBreakdownResponse)
def update_employee_salary(
    employee_id: int,
    payload: SalaryUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee #{employee_id} not found"
        )

    if payload.monthly_wage <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly wage must be greater than zero"
        )

    sal = db.query(SalaryInformation).filter(SalaryInformation.employee_id == employee_id).first()
    if not sal:
        sal = SalaryInformation(employee_id=employee_id, monthly_wage=payload.monthly_wage)
        db.add(sal)
    else:
        sal.monthly_wage = payload.monthly_wage

    db.commit()
    db.refresh(sal)
    return calculate_salary_breakdown(emp, sal.monthly_wage)
