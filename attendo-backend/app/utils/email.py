from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.config import settings
import random
from datetime import datetime, timedelta

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def get_otp_expiry() -> datetime:
    """Get OTP expiry time"""
    return datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

async def send_otp_email(email: str, otp: str, purpose: str, user_type: str):
    """Send OTP via email"""
    
    if purpose == "registration":
        subject = "Welcome to Attendo - Verify Your Email"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4F46E5; margin: 0;">Attendo</h1>
                        <p style="color: #6B7280; margin-top: 5px;">Smart Attendance System</p>
                    </div>
                    
                    <h2 style="color: #1F2937; margin-bottom: 20px;">Welcome to Attendo!</h2>
                    
                    <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                        Thank you for registering as a <strong>{user_type}</strong>. To complete your registration, please verify your email address using the OTP below:
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
                        <p style="color: white; margin: 0; font-size: 14px; margin-bottom: 10px;">Your OTP Code</p>
                        <h1 style="color: white; margin: 0; font-size: 42px; letter-spacing: 8px; font-weight: bold;">{otp}</h1>
                    </div>
                    
                    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                        <p style="margin: 0; color: #92400E; font-size: 14px;">
                            ⚠️ This OTP will expire in <strong>{settings.OTP_EXPIRY_MINUTES} minutes</strong>
                        </p>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                    
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email from Attendo. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
    else:  # login
        subject = "Attendo - Login Verification Code"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4F46E5; margin: 0;">Attendo</h1>
                        <p style="color: #6B7280; margin-top: 5px;">Smart Attendance System</p>
                    </div>
                    
                    <h2 style="color: #1F2937; margin-bottom: 20px;">Login Verification</h2>
                    
                    <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                        Someone is trying to log in to your Attendo account. If this is you, please use the OTP below to continue:
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
                        <p style="color: white; margin: 0; font-size: 14px; margin-bottom: 10px;">Your OTP Code</p>
                        <h1 style="color: white; margin: 0; font-size: 42px; letter-spacing: 8px; font-weight: bold;">{otp}</h1>
                    </div>
                    
                    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                        <p style="margin: 0; color: #92400E; font-size: 14px;">
                            ⚠️ This OTP will expire in <strong>{settings.OTP_EXPIRY_MINUTES} minutes</strong>
                        </p>
                    </div>
                    
                    <div style="background-color: #FEE2E2; padding: 15px; border-radius: 8px; border-left: 4px solid #DC2626; margin: 20px 0;">
                        <p style="margin: 0; color: #991B1B; font-size: 14px;">
                            🔒 If you didn't try to log in, please ignore this email and consider changing your password.
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                    
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email from Attendo. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)