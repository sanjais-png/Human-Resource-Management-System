import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import OTPVerification
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_test_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

client = TestClient(app)

def test_send_otp_success():
    res = client.post("/api/auth/send-otp", json={"email": "newuser@hrms.com"})
    assert res.status_code == 200
    data = res.json()
    assert "sent" in data["message"].lower()

def test_verify_otp_success():
    send_res = client.post("/api/auth/send-otp", json={"email": "verifyuser@hrms.com"})
    assert send_res.status_code == 200

    db = TestingSessionLocal()
    otp_record = db.query(OTPVerification).filter(OTPVerification.email == "verifyuser@hrms.com").first()
    otp_code = otp_record.otp_code
    db.close()

    verify_res = client.post("/api/auth/verify-otp", json={"email": "verifyuser@hrms.com", "otp_code": otp_code})
    assert verify_res.status_code == 200
    assert "verified" in verify_res.json()["message"].lower()

def test_verify_otp_invalid_code():
    client.post("/api/auth/send-otp", json={"email": "wrongotp@hrms.com"})
    verify_res = client.post("/api/auth/verify-otp", json={"email": "wrongotp@hrms.com", "otp_code": "000000"})
    assert verify_res.status_code == 400
    assert "Invalid OTP" in verify_res.json()["detail"]
