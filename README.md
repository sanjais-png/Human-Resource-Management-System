# Human Resource Management System (HRMS)

A full-stack enterprise Human Resource Management System built with **FastAPI**, **SQLAlchemy**, **SQLite**, **React (Vite)**, and **Tailwind CSS**.

---

## Architecture & Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, SQLite, Passlib (Bcrypt), PyJWT (python-jose), Pydantic v2
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6
- **Authentication & Security**: JSON Web Tokens (JWT) with Bearer token authentication & Role-Based Access Control (RBAC)

---

## Roles & Access Control Matrix

The system enforces strict RBAC across both the backend APIs and the frontend UI:

| Feature / Endpoint | ADMIN | HR | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| **Authentication & Profile** | Full | Full | Own Profile Only |
| **Employee Administration** | Create / Read / Edit | Create / Read / Edit | Read Only |
| **Attendance Management** | View All / Punch | View All / Punch | Own Punch & History Only |
| **Time Off Requests** | Create & Approve/Reject | Create & Approve/Reject | Create & View Own Requests |
| **Salary Information** | **Full Access (CRUD)** | ❌ **Forbidden (403)** | ❌ **Forbidden (403)** |

---

## Demo Credentials

The database comes pre-seeded with 3 primary demo accounts representing each role:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@hrms.com` | `admin123` | Full System Access (Includes Salary & Payroll Management) |
| **HR** | `hr@hrms.com` | `hr123456` | Employee & Attendance Management, Leave Approvals |
| **EMPLOYEE** | `john@hrms.com` | `emp123456` | Self-Service Profile, Daily Attendance Punch, Leave Requests |

---

## Quick Setup Instructions

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ and npm

### 1. Backend Setup & Database Initialization

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the idempotent database seed script (creates hrms.db and demo accounts)
python seed.py

# Start the FastAPI backend server
python -m uvicorn app.main:app --reload --port 8000
```
- Backend API root: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
- Frontend application URL: `http://localhost:5173`

---

## Database Setup & Idempotent Seeding

The database uses SQLite (`backend/hrms.db`). Running `python seed.py` performs the following automated setup:
1. Creates all database tables (`users`, `employees`, `attendances`, `leave_balances`, `time_off_requests`, `salary_informations`).
2. Seeds demo accounts for `admin@hrms.com`, `hr@hrms.com`, and `john@hrms.com` without creating duplicates.
3. Seeds sample employees (`EMP001` through `EMP006`).
4. Generates historical attendance records and initial leave balances (24 PTO days, 7 Sick days).

To reset the database cleanly at any time:
```bash
cd backend
rm hrms.db
python seed.py
```

---

## Verification & Automated Testing

### Backend Test Suite (Pytest)
Run all 37 backend integration and unit tests:
```bash
cd backend
pytest
```

### Frontend Production Build Test
Verify clean production compilation:
```bash
cd frontend
npm run build
```

---

## Main Evaluation Workflows

1. **ADMIN Workflow**:
   - Log in as `admin@hrms.com` / `admin123`.
   - View company-wide Dashboard KPIs.
   - Navigate to Employees page → Create a new Employee.
   - Navigate to Employee Profile → Edit details.
   - Navigate to Salary Info → View dynamic Indian statutory breakdown & update Monthly Wage.

2. **HR Workflow**:
   - Log in as `hr@hrms.com` / `hr123456`.
   - View Employee Directory.
   - Access Attendance Management → View company-wide attendance logs.
   - Access Time Off → Approve or Reject pending employee leave requests.
   - Attempt to access Salary page → Verify **403 Forbidden Access Denied** protection.

3. **EMPLOYEE Workflow**:
   - Log in as `john@hrms.com` / `emp123456`.
   - View Dashboard.
   - Access My Profile → Edit work phone, address, skills, and bio.
   - Access Attendance → Perform Check-In and Check-Out.
   - Access Time Off → Submit new leave request.
