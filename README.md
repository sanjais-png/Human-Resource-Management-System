# HRMS - Human Resource Management System

A full-stack Human Resource Management System built for end-to-end HR workflows including Employee Management, Attendance Tracking, Leave Management, and Salary Calculation.

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Lucide React
- **Backend**: FastAPI, SQLAlchemy ORM, Pydantic, JWT Authentication, Passlib/Bcrypt
- **Database**: SQLite (Reproducible via seed script)

## Demo Credentials

| Role | Email | Password | Access Level |
| --- | --- | --- | --- |
| **Admin** | `admin@hrms.com` | `admin123` | Full access (Employee, Attendance, Time Off, Salary) |
| **HR** | `hr@hrms.com` | `hr123456` | Employee management, Attendance, Time Off (No Salary) |
| **Employee** | `john@hrms.com` | `emp123456` | Personal Profile, Own Attendance, Own Time Off |

## Setup & Running Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.
