import sys
import os
from datetime import datetime, date, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models import User, Employee, Attendance, UserRole, SalaryInformation, LeaveBalance
from app.auth import get_password_hash
from app.routers.employees import generate_emp_code, generate_login_id

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        demo_users = [
            {
                "email": "admin@hrms.com",
                "password": "admin123",
                "full_name": "System Administrator",
                "role": UserRole.ADMIN,
                "first_name": "System",
                "last_name": "Admin",
                "dept": "Executive",
                "position": "Chief Administrator",
                "status": "Present",
                "wage": 150000.0,
            },
            {
                "email": "hr@hrms.com",
                "password": "hr123456",
                "full_name": "Sarah Jenkins",
                "role": UserRole.HR,
                "first_name": "Sarah",
                "last_name": "Jenkins",
                "dept": "Human Resources",
                "position": "HR Manager",
                "status": "Present",
                "wage": 85000.0,
            },
            {
                "email": "john@hrms.com",
                "password": "emp123456",
                "full_name": "John Doe",
                "role": UserRole.EMPLOYEE,
                "first_name": "John",
                "last_name": "Doe",
                "dept": "Engineering",
                "position": "Senior Software Engineer",
                "status": "Present",
                "wage": 60000.0,
            },
        ]

        for u in demo_users:
            user = db.query(User).filter(User.email == u["email"]).first()
            if not user:
                user = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    is_active=True,
                )
                db.add(user)
                db.flush()

            emp = db.query(Employee).filter(Employee.email == u["email"]).first()
            if not emp:
                code = generate_emp_code(db, first_name=u["first_name"], last_name=u["last_name"], company="Odoo India", date_of_joining="2024-01-10")
                login = code
                emp = Employee(
                    user_id=user.id,
                    emp_code=code,
                    login_id=login,
                    first_name=u["first_name"],
                    last_name=u["last_name"],
                    email=u["email"],
                    phone="+1 555-0100",
                    department=u["dept"],
                    job_position=u["position"],
                    manager_name="System Admin" if u["role"] != UserRole.ADMIN else "Board of Directors",
                    company="Dayflow Corp",
                    location="Headquarters",
                    date_of_joining="2024-01-10",
                    avatar_url=f"https://ui-avatars.com/api/?name={u['first_name']}+{u['last_name']}&background=6366f1&color=fff",
                    status=u["status"],
                    date_of_birth="1992-08-14",
                    gender="Male" if u["first_name"] != "Sarah" else "Female",
                    nationality="Indian",
                    marital_status="Single",
                    address="123 Technology Boulevard, Tech Park",
                    personal_email=f"personal.{u['email']}",
                    pan_number="ABCDE1234F",
                    uan_number="100908070605",
                    bank_name="HDFC Bank",
                    account_number="987654321012",
                    ifsc_code="HDFC0001234",
                    skills="Python, React, FastAPI, SQL, Tailwind CSS",
                    resume_summary="Experienced professional specializing in software architecture, web development, and team collaboration.",
                    what_i_love="Collaborating with talented teams and building innovative software solutions that simplify daily workflows.",
                    hobbies="Coding, Photography, Chess, and Traveling.",
                    certifications="AWS Certified Solutions Architect, Certified Scrum Master"
                )
                db.add(emp)
                db.flush()

                # Seed Salary Info
                sal = SalaryInformation(employee_id=emp.id, monthly_wage=u["wage"])
                db.add(sal)

                # Seed Leave Balance
                lb = LeaveBalance(employee_id=emp.id, paid_time_off=20.0, sick_leave=10.0, unpaid_leave=30.0)
                db.add(lb)

        sample_employees = [
            {
                "first_name": "Emily",
                "last_name": "Watson",
                "email": "emily.watson@hrms.com",
                "phone": "+1 555-0101",
                "department": "Engineering",
                "job_position": "Frontend Lead",
                "manager_name": "John Doe",
                "status": "Present",
                "wage": 55000.0,
            },
            {
                "first_name": "Marcus",
                "last_name": "Vance",
                "email": "marcus.vance@hrms.com",
                "phone": "+1 555-0102",
                "department": "Design",
                "job_position": "UI/UX Designer",
                "manager_name": "Sarah Jenkins",
                "status": "On Leave",
                "wage": 50000.0,
            },
            {
                "first_name": "Priya",
                "last_name": "Sharma",
                "email": "priya.sharma@hrms.com",
                "phone": "+1 555-0103",
                "department": "Marketing",
                "job_position": "Growth Strategist",
                "manager_name": "Sarah Jenkins",
                "status": "Absent",
                "wage": 48000.0,
            },
        ]

        for s in sample_employees:
            emp = db.query(Employee).filter(Employee.email == s["email"]).first()
            if not emp:
                code = generate_emp_code(db, first_name=s["first_name"], last_name=s["last_name"], company="Odoo India", date_of_joining="2025-06-01")
                login = code
                emp = Employee(
                    emp_code=code,
                    login_id=login,
                    first_name=s["first_name"],
                    last_name=s["last_name"],
                    email=s["email"],
                    phone=s["phone"],
                    department=s["department"],
                    job_position=s["job_position"],
                    manager_name=s["manager_name"],
                    company="Dayflow Corp",
                    location="Headquarters",
                    date_of_joining="2025-06-01",
                    avatar_url=f"https://ui-avatars.com/api/?name={s['first_name']}+{s['last_name']}&background=0284c7&color=fff",
                    status=s["status"],
                    date_of_birth="1996-03-25",
                    gender="Female" if s["first_name"] in ["Emily", "Priya"] else "Male",
                    nationality="Indian",
                    marital_status="Single",
                    address="456 Innovation Way, Tech District",
                    personal_email=f"personal.{s['email']}",
                    pan_number="XYZDE5678G",
                    uan_number="100908070999",
                    bank_name="ICICI Bank",
                    account_number="987654321999",
                    ifsc_code="ICIC0005678",
                    skills="Figma, React, UI Architecture, User Research",
                    resume_summary="Creative professional driven by human-centered design principles and seamless digital interfaces.",
                    what_i_love="Crafting intuitive user experiences that delight users and drive business value.",
                    hobbies="Digital Art, Music, Reading, Hiking.",
                    certifications="UX Design Professional Certification"
                )
                db.add(emp)
                db.flush()

                sal = SalaryInformation(employee_id=emp.id, monthly_wage=s["wage"])
                db.add(sal)

                lb = LeaveBalance(employee_id=emp.id, paid_time_off=20.0, sick_leave=10.0, unpaid_leave=30.0)
                db.add(lb)

        db.commit()

        # Seed Attendance History for past 3 days
        all_emps = db.query(Employee).all()
        today = date.today()
        past_dates = [(today - timedelta(days=i)).isoformat() for i in range(1, 4)]

        for emp in all_emps:
            for d in past_dates:
                att_exists = db.query(Attendance).filter(
                    Attendance.employee_id == emp.id,
                    Attendance.date == d
                ).first()
                if not att_exists:
                    in_time = f"{d}T09:00:00"
                    out_time = f"{d}T17:30:00" if emp.status != "Absent" else None
                    work_hrs = 8.5 if out_time else 0.0
                    extra_hrs = 0.5 if out_time else 0.0
                    att_status = "Present" if out_time else "Absent"
                    if emp.status == "On Leave":
                        att_status = "Leave"

                    att = Attendance(
                        employee_id=emp.id,
                        date=d,
                        check_in=in_time if att_status != "Absent" else None,
                        check_out=out_time if att_status != "Absent" else None,
                        work_hours=work_hrs if att_status == "Present" else 0.0,
                        extra_hours=extra_hrs if att_status == "Present" else 0.0,
                        status=att_status
                    )
                    db.add(att)

        db.commit()
        print("Database seed finished successfully with attendance records and demo values!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
