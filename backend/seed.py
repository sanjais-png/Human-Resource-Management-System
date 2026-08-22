import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models import User, Employee, UserRole
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
                print(f"Created user: {u['email']} ({u['role'].value})")

            emp = db.query(Employee).filter(Employee.email == u["email"]).first()
            if not emp:
                code = generate_emp_code(db)
                login = generate_login_id(db, u["first_name"], u["last_name"])
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
                    company="HRMS Corp",
                    location="Headquarters",
                    date_of_joining="2024-01-10",
                    avatar_url=f"https://ui-avatars.com/api/?name={u['first_name']}+{u['last_name']}&background=6366f1&color=fff",
                    status=u["status"],
                )
                db.add(emp)
                db.flush()
                print(f"Created employee: {code} - {u['first_name']} {u['last_name']}")

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
            },
        ]

        for s in sample_employees:
            emp = db.query(Employee).filter(Employee.email == s["email"]).first()
            if not emp:
                code = generate_emp_code(db)
                login = generate_login_id(db, s["first_name"], s["last_name"])
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
                    company="HRMS Corp",
                    location="Headquarters",
                    date_of_joining="2025-06-01",
                    avatar_url=f"https://ui-avatars.com/api/?name={s['first_name']}+{s['last_name']}&background=0284c7&color=fff",
                    status=s["status"],
                )
                db.add(emp)
                db.flush()
                print(f"Created sample employee: {code} - {s['first_name']} {s['last_name']}")

        db.commit()
        print("Database seed finished successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
