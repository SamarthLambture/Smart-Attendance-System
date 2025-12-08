from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from app.config import settings

# Student Schemas
class StudentBase(BaseModel):
    name: str
    roll_number: str
    email: EmailStr
    branch: str
    year: str

class StudentCreate(StudentBase):
    @validator('email')
    def validate_email(cls, v):
        if not v.endswith(f"@{settings.ALLOWED_COLLEGE_DOMAIN}"):
            raise ValueError(f'Email must be from {settings.ALLOWED_COLLEGE_DOMAIN}')
        
        # Extract branch from email (e.g., CS24B1027@iiitr.ac.in)
        email_prefix = v.split('@')[0].upper()
        branch_code = email_prefix[:2]
        
        if branch_code not in settings.VALID_BRANCHES:
            raise ValueError(f'Invalid branch code in email. Must be one of: {", ".join(settings.VALID_BRANCHES)}')
        
        return v
    
    @validator('branch')
    def validate_branch(cls, v):
        valid_branches = ["Computer Science & Engineering", "Artifical Intelligence & Data Science", "Mathematics & Computing"]
        if v not in valid_branches:
            raise ValueError(f'Invalid branch. Must be one of: {", ".join(valid_branches)}')
        return v

class StudentResponse(StudentBase):
    id: int
    photo_path: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Faculty Schemas
class FacultyBase(BaseModel):
    name: str
    faculty_id: str
    email: EmailStr
    department: Optional[str] = None
    designation: Optional[str] = None

class FacultyCreate(FacultyBase):
    pass

class FacultyResponse(FacultyBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# OTP Schemas
class OTPRequest(BaseModel):
    email: EmailStr
    user_type: str  # 'student' or 'faculty'
    purpose: str  # 'registration' or 'login'
    
    @validator('user_type')
    def validate_user_type(cls, v):
        if v not in ['student', 'faculty']:
            raise ValueError('user_type must be either "student" or "faculty"')
        return v
    
    @validator('purpose')
    def validate_purpose(cls, v):
        if v not in ['registration', 'login']:
            raise ValueError('purpose must be either "registration" or "login"')
        return v

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str
    user_type: str
    
    @validator('otp_code')
    def validate_otp(cls, v):
        if len(v) != 6 or not v.isdigit():
            raise ValueError('OTP must be 6 digits')
        return v

# Response Schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    detail: str
    success: bool = False