import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "supportauthoodo@gmail.com"
SENDER_PASSWORD = "loxx ycqc urjb algg"

logger = logging.getLogger("hrms.email")

def send_otp_email(recipient_email: str, otp_code: str) -> bool:
    subject = "Dayflow HRMS — Your Account Verification OTP Code"
    body = f"""
Hello,

Your One-Time Password (OTP) for Dayflow HRMS account verification is:

    ======================
        {otp_code}
    ======================

This code is valid for 10 minutes. Please do not share this OTP with anyone.

If you did not request this verification, please ignore this email.

Best regards,
Dayflow HRMS Support Team
supportauthoodo@gmail.com
"""

    msg = MIMEMultipart()
    msg['From'] = f"Dayflow HRMS Support <{SENDER_EMAIL}>"
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=8)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()
        logger.info(f"OTP email successfully sent to {recipient_email}")
        print(f"[OTP SUCCESS] Sent OTP {otp_code} via SMTP to {recipient_email}")
        return True
    except Exception as e:
        logger.warning(f"Failed to send OTP via SMTP to {recipient_email}: {e}")
        print(f"[OTP LOCAL FALLBACK] OTP for {recipient_email} is {otp_code} (SMTP Note: {e})")
        return False
