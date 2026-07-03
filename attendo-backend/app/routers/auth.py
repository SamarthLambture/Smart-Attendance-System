from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student, Faculty, OTP
from app.schemas import (
    OTPRequest, OTPVerify, MessageResponse,
    StudentCreate, StudentResponse,
    FacultyCreate, FacultyResponse
)
from app.utils.email import send_otp_email, generate_otp, get_otp_expiry
from app.utils.face_recognition import get_face_service
from datetime import datetime
from typing import Optional
import os
from pathlib import Path
import shutil
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Create directories
TEMP_PHOTO_DIR = Path("temp_photos")
PHOTO_DIR = Path("photos")
TEMP_PHOTO_DIR.mkdir(exist_ok=True)
PHOTO_DIR.mkdir(exist_ok=True)

def process_face_registration(photo_path: str, student_email: str, roll_number: str, student_name: str):
    """Background task to process face registration"""
    try:
        face_service = get_face_service()
        success, message = face_service.register_face(
            student_email=student_email,
            roll_number=roll_number,
            student_name=student_name,
            photo_path=photo_path
        )
        
        if success:
            logger.info(f"âœ… Face registered for {student_name} ({roll_number})")
        else:
            logger.error(f"âŒ Face registration failed for {roll_number}: {message}")
            
    except Exception as e:
        logger.error(f"Error in face registration background task: {str(e)}")

@router.post("/send-otp", response_model=MessageResponse)
async def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """
    Send OTP to email
    - For registration: Check if email doesn't exist
    - For login: Check if email exists
    """
    
    # Check if user exists based on user type
    if request.user_type == "student":
        user = db.query(Student).filter(Student.email == request.email).first()
    else:
        user = db.query(Faculty).filter(Faculty.email == request.email).first()
    
    # Validation based on purpose
    if request.purpose == "registration":
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email already registered. Please login instead."
            )
    else:  # login
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Email not registered. Please register first."
            )
    
    # Invalidate any existing OTPs for this email
    db.query(OTP).filter(
        OTP.email == request.email,
        OTP.user_type == request.user_type
    ).update({"is_used": True})
    db.commit()
    
    # Generate new OTP
    otp_code = generate_otp()
    otp_expiry = get_otp_expiry()
    
    # Save OTP to database
    new_otp = OTP(
        email=request.email,
        otp_code=otp_code,
        user_type=request.user_type,
        purpose=request.purpose,
        expires_at=otp_expiry
    )
    db.add(new_otp)
    db.commit()
    
    # Send OTP via email
    try:
        await send_otp_email(
            email=request.email,
            otp=otp_code,
            purpose=request.purpose,
            user_type=request.user_type
        )
    except Exception as e:
        # Rollback OTP creation if email fails
        db.delete(new_otp)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )
    
    return MessageResponse(
        message=f"OTP sent successfully to {request.email}",
        success=True
    )

@router.post("/verify-otp", response_model=MessageResponse)
async def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP code"""
    
    # Find the OTP
    otp_record = db.query(OTP).filter(
        OTP.email == request.email,
        OTP.user_type == request.user_type,
        OTP.otp_code == request.otp_code,
        OTP.is_used == False
    ).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # Check if OTP is expired
    if datetime.utcnow() > otp_record.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Mark OTP as used
    otp_record.is_used = True
    db.commit()
    
    return MessageResponse(
        message="OTP verified successfully",
        success=True
    )

@router.post("/student/register", response_model=StudentResponse)
async def register_student(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    roll_number: str = Form(...),
    email: str = Form(...),
    branch: str = Form(...),
    year: str = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Register a new student with photo and face recognition
    
    NEW: Creates face embedding in background task
    """
    
    # Check if student already exists
    existing_student = db.query(Student).filter(
        (Student.email == email) | (Student.roll_number == roll_number)
    ).first()
    
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student with this email or roll number already exists"
        )
    
    # Save photo
    file_extension = os.path.splitext(photo.filename)[1]
    if file_extension.lower() not in ['.jpg', '.jpeg', '.png']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photo must be JPG or PNG format"
        )
    
    # Save directly to photos folder
    final_filename = f"{roll_number}{file_extension}"
    final_file_path = PHOTO_DIR / final_filename
    
    with open(final_file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    # Create student in database
    new_student = Student(
        name=name,
        roll_number=roll_number,
        email=email,
        branch=branch,
        year=year,
        photo_path=str(final_file_path)
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    # ðŸ†• Add face registration as background task
    background_tasks.add_task(
        process_face_registration,
        photo_path=str(final_file_path),
        student_email=email,
        roll_number=roll_number,
        student_name=name
    )
    
    logger.info(f"Student registered: {name} ({roll_number}). Face registration queued.")
    
    return new_student

@router.post("/faculty/register", response_model=FacultyResponse)
async def register_faculty(
    faculty_data: FacultyCreate,
    db: Session = Depends(get_db)
):
    """Register a new faculty member"""
    
    # Check if faculty already exists
    existing_faculty = db.query(Faculty).filter(
        (Faculty.email == faculty_data.email) | 
        (Faculty.faculty_id == faculty_data.faculty_id)
    ).first()
    
    if existing_faculty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty with this email or faculty ID already exists"
        )
    
    # Create faculty
    new_faculty = Faculty(**faculty_data.dict())
    
    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)
    
    return new_faculty

@router.post("/student/login", response_model=StudentResponse)
async def login_student(
    email: str = Form(...),
    db: Session = Depends(get_db)
):
    """Student login - returns student data if exists"""
    
    student = db.query(Student).filter(Student.email == email).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    if not student.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    return student

@router.post("/faculty/login", response_model=FacultyResponse)
async def login_faculty(
    email: str = Form(...),
    db: Session = Depends(get_db)
):
    """Faculty login - returns faculty data if exists"""
    
    faculty = db.query(Faculty).filter(Faculty.email == email).first()
    
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    if not faculty.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    return faculty

@router.get("/student/profile/{email}", response_model=StudentResponse)
async def get_student_profile(
    email: str,
    db: Session = Depends(get_db)
):
    """Get student profile by email"""
    
    student = db.query(Student).filter(Student.email == email).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student

@router.get("/faculty/profile/{email}", response_model=FacultyResponse)
async def get_faculty_profile(
    email: str,
    db: Session = Depends(get_db)
):
    """Get faculty profile by email"""
    
    faculty = db.query(Faculty).filter(Faculty.email == email).first()
    
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    return faculty