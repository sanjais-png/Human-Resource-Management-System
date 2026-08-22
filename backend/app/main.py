from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import User, Employee, Attendance, LeaveBalance, TimeOffRequest, SalaryInformation
from app.routers import auth, employees, profile, attendance, time_off, salary

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HRMS API",
    description="Human Resource Management System Backend API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(profile.router)
app.include_router(attendance.router)
app.include_router(time_off.router)
app.include_router(salary.router)

@app.get("/")
def read_root():
    return {"message": "HRMS API is running successfully", "status": "online"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
