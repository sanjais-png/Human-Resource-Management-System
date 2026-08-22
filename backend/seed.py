import sys
import os

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models import User, UserRole
from app.auth import get_password_hash

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
            },
            {
                "email": "hr@hrms.com",
                "password": "hr123456",
                "full_name": "Sarah Jenkins (HR Manager)",
                "role": UserRole.HR,
            },
            {
                "email": "john@hrms.com",
                "password": "emp123456",
                "full_name": "John Doe (Software Engineer)",
                "role": UserRole.EMPLOYEE,
            },
        ]

        created_count = 0
        for u in demo_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    is_active=True,
                )
                db.add(user)
                created_count += 1
                print(f"Created user: {u['email']} ({u['role'].value})")
            else:
                print(f"User already exists: {u['email']}")

        db.commit()
        print(f"Seeding completed successfully! Created {created_count} new users.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
