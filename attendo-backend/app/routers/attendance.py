from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.database import get_db
from app.models import AttendanceSession, AttendanceRecord, Student, Subject, Faculty
from app.utils.face_recognition import get_face_service
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
import random
import string
import os
from pathlib import Path
import shutil
import logging
import numpy as np

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

# Create attendance photos directory
ATTENDANCE_PHOTO_DIR = Path("attendance_photos")
ATTENDANCE_PHOTO_DIR.mkdir(exist_ok=True)

# Schemas
class SessionCreateRequest(BaseModel):
    faculty_email: str
    subject_id: int

class SessionResponse(BaseModel):
    session_id: int
    session_code: str
    qr_data: str
    expires_at: datetime
    subject_name: str
    subject_code: str
    
    class Config:
        from_attributes = True

class ValidateCodeRequest(BaseModel):
    session_code: str
    subject_id: int

class AttendanceStats(BaseModel):
    total_classes: int
    attended_classes: int
    attendance_percentage: float

class AttendanceRecordResponse(BaseModel):
    id: int
    student_name: str
    roll_number: str
    marked_at: datetime
    photo_path: str
    
    class Config:
        from_attributes = True

class AttendanceRegisterEntry(BaseModel):
    student_id: int
    roll_number: str
    student_name: str
    dates: dict
    total_present: int
    total_classes: int
    attendance_percentage: float

class AttendanceRegisterResponse(BaseModel):
    subject_name: str
    subject_code: str
    dates: List[str]
    students: List[AttendanceRegisterEntry]

def cleanup_photo(photo_path: str):
    """Background task to delete photo after processing"""
    try:
        if Path(photo_path).exists():
            os.remove(photo_path)
            logger.info(f"🗑️ Deleted photo: {photo_path}")
    except Exception as e:
        logger.error(f"Error deleting photo: {str(e)}")

def generate_session_code(length=5):
    """Generate random alphanumeric code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.post("/session/create", response_model=SessionResponse)
async def create_attendance_session(
    request: SessionCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new attendance session with QR code and attendance code
    Valid for 4 minutes (240 seconds)
    """
    
    # Find faculty
    faculty = db.query(Faculty).filter(Faculty.email == request.faculty_email).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    # Find subject
    subject = db.query(Subject).filter(Subject.id == request.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check if faculty is assigned to this subject
    if subject not in faculty.subjects:
        raise HTTPException(status_code=403, detail="Not authorized for this subject")
    
    current_time = datetime.utcnow()
    
    # Check for recent session (prevent duplicates)
    recent_time_window = current_time - timedelta(seconds=10)
    
    very_recent_session = db.query(AttendanceSession).filter(
        AttendanceSession.subject_id == request.subject_id,
        AttendanceSession.faculty_id == faculty.id,
        AttendanceSession.date >= recent_time_window
    ).order_by(AttendanceSession.date.desc()).first()
    
    if very_recent_session:
        # Reuse existing session
        new_code = generate_session_code()
        while db.query(AttendanceSession).filter(
            AttendanceSession.session_code == new_code,
            AttendanceSession.id != very_recent_session.id
        ).first():
            new_code = generate_session_code()
        
        very_recent_session.session_code = new_code
        very_recent_session.qr_data = new_code
        very_recent_session.expires_at = current_time + timedelta(minutes=4)
        very_recent_session.is_active = True
        
        db.commit()
        db.refresh(very_recent_session)
        
        return SessionResponse(
            session_id=very_recent_session.id,
            session_code=very_recent_session.session_code,
            qr_data=very_recent_session.session_code,
            expires_at=very_recent_session.expires_at,
            subject_name=subject.subject_name,
            subject_code=subject.subject_code
        )
    
    # Mark old sessions as inactive
    db.query(AttendanceSession).filter(
        AttendanceSession.subject_id == request.subject_id,
        AttendanceSession.is_active == True
    ).update({"is_active": False})
    db.commit()
    
    # Generate unique session code
    session_code = generate_session_code()
    while db.query(AttendanceSession).filter(
        AttendanceSession.session_code == session_code
    ).first():
        session_code = generate_session_code()
    
    # Create new session
    expires_at = current_time + timedelta(minutes=4)
    
    new_session = AttendanceSession(
        faculty_id=faculty.id,
        subject_id=subject.id,
        session_code=session_code,
        qr_data=session_code,
        expires_at=expires_at,
        is_active=True,
        date=current_time
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return SessionResponse(
        session_id=new_session.id,
        session_code=session_code,
        qr_data=session_code,
        expires_at=expires_at,
        subject_name=subject.subject_name,
        subject_code=subject.subject_code
    )

@router.post("/validate-code")
async def validate_attendance_code(
    request: ValidateCodeRequest,
    db: Session = Depends(get_db)
):
    """Validate if the scanned/entered code is valid and not expired"""
    
    session = db.query(AttendanceSession).filter(
        AttendanceSession.session_code == request.session_code,
        AttendanceSession.subject_id == request.subject_id,
        AttendanceSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=400,
            detail="Invalid attendance code or code not for this subject"
        )
    
    if datetime.utcnow() > session.expires_at:
        session.is_active = False
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Attendance code has expired"
        )
    
    return {
        "valid": True,
        "session_id": session.id,
        "expires_in_seconds": (session.expires_at - datetime.utcnow()).total_seconds()
    }

@router.post("/mark")
async def mark_attendance(
    background_tasks: BackgroundTasks,
    session_code: str = Form(...),
    subject_id: int = Form(...),
    student_email: str = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    🆕 Mark attendance with face verification
    
    Flow:
    1. Save photo temporarily
    2. Verify face matches registered student
    3. If match found, mark attendance and delete photo
    4. If no match, keep photo for manual review
    """
    
    # Find student
    student = db.query(Student).filter(Student.email == student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Find and validate session
    session = db.query(AttendanceSession).filter(
        AttendanceSession.session_code == session_code,
        AttendanceSession.subject_id == subject_id,
        AttendanceSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(status_code=400, detail="Invalid attendance code")
    
    # Check if expired
    if datetime.utcnow() > session.expires_at:
        session.is_active = False
        db.commit()
        raise HTTPException(status_code=400, detail="Attendance code has expired")
    
    # Check if student is enrolled in this subject
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if subject not in student.subjects:
        raise HTTPException(
            status_code=403,
            detail="You are not enrolled in this subject"
        )
    
    # Check if already marked attendance for this session
    existing_record = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student.id,
        AttendanceRecord.session_id == session.id
    ).first()
    
    if existing_record:
        raise HTTPException(
            status_code=400,
            detail="Attendance already marked for this session"
        )
    
    # Save photo
    file_extension = os.path.splitext(photo.filename)[1]
    if file_extension.lower() not in ['.jpg', '.jpeg', '.png']:
        raise HTTPException(
            status_code=400,
            detail="Photo must be JPG or PNG format"
        )
    
    photo_filename = f"{student.roll_number}_{session.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
    photo_path = ATTENDANCE_PHOTO_DIR / photo_filename
    
    with open(photo_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    # 🆕 FACE VERIFICATION
    try:
        face_service = get_face_service()
        match_found, matched_student, similarity = face_service.verify_face(
            photo_path=str(photo_path),
            threshold=0.70  # YOUR threshold from face_test.py
        )
        
        # 🔧 FIX: Convert numpy float to Python float
        if isinstance(similarity, (np.floating, np.float32, np.float64)):
            similarity = float(similarity)
        
        if not match_found:
            # No match found - keep photo for manual review
            logger.warning(f"⚠️ Face verification failed for {student.roll_number}")
            logger.warning(f"Best similarity score: {similarity:.4f}")
            raise HTTPException(
                status_code=403,
                detail=f"Face verification failed. Your face does not match registered face (similarity: {similarity:.2f}). Please try again or contact administrator."
            )
        
        # Check if matched student is the same as claimed student
        if matched_student['email'] != student_email:
            logger.error(f"❌ Face mismatch! Photo from {student_email} matched {matched_student['email']}")
            raise HTTPException(
                status_code=403,
                detail=f"Face verification failed. Face matches {matched_student['name']} ({matched_student['roll_number']}), not your registered face."
            )
        
        logger.info(f"✅ Face verified for {student.name} ({student.roll_number}) - Similarity: {similarity:.4f}")
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Face verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Face verification system error. Please try again."
        )
    
    # Create attendance record (only if face verified)
    attendance_record = AttendanceRecord(
        student_id=student.id,
        session_id=session.id,
        subject_id=subject_id,
        photo_path=str(photo_path),
        is_valid=True
    )
    
    db.add(attendance_record)
    db.commit()
    db.refresh(attendance_record)
    
    # 🗑️ Delete photo in background (verified and recorded)
    background_tasks.add_task(cleanup_photo, str(photo_path))
    
    return {
        "success": True,
        "message": "Attendance marked successfully. Face verified!",
        "record_id": attendance_record.id,
        "verified_similarity": round(similarity, 4)  # Already converted to Python float
    }

@router.get("/stats/{student_email}/{subject_id}", response_model=AttendanceStats)
async def get_attendance_stats(
    student_email: str,
    subject_id: int,
    db: Session = Depends(get_db)
):
    """Get attendance statistics for a student in a specific subject"""
    
    student = db.query(Student).filter(Student.email == student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    total_classes = db.query(AttendanceSession).filter(
        AttendanceSession.subject_id == subject_id,
        AttendanceSession.date < datetime.utcnow()
    ).count()
    
    attended_classes = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student.id,
        AttendanceRecord.subject_id == subject_id,
        AttendanceRecord.is_valid == True
    ).count()
    
    percentage = (attended_classes / total_classes * 100) if total_classes > 0 else 0
    
    return AttendanceStats(
        total_classes=total_classes,
        attended_classes=attended_classes,
        attendance_percentage=round(percentage, 2)
    )

@router.get("/register/{subject_id}", response_model=AttendanceRegisterResponse)
async def get_attendance_register(
    subject_id: int,
    faculty_email: str,
    db: Session = Depends(get_db)
):
    """Get complete attendance register for a subject (faculty view)"""
    
    faculty = db.query(Faculty).filter(Faculty.email == faculty_email).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    if subject not in faculty.subjects:
        raise HTTPException(status_code=403, detail="Not authorized for this subject")
    
    sessions = db.query(AttendanceSession).filter(
        AttendanceSession.subject_id == subject_id
    ).order_by(AttendanceSession.date).all()
    
    dates = [session.date.strftime("%Y-%m-%d %H:%M") for session in sessions]
    
    students_data = []
    
    for student in subject.students:
        attendance_records = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == student.id,
            AttendanceRecord.subject_id == subject_id
        ).all()
        
        attended_session_ids = {record.session_id for record in attendance_records}
        
        date_status = {}
        for session in sessions:
            date_str = session.date.strftime("%Y-%m-%d %H:%M")
            date_status[date_str] = "P" if session.id in attended_session_ids else "A"
        
        total_present = len(attended_session_ids)
        total_classes = len(sessions)
        percentage = (total_present / total_classes * 100) if total_classes > 0 else 0
        
        students_data.append(AttendanceRegisterEntry(
            student_id=student.id,
            roll_number=student.roll_number,
            student_name=student.name,
            dates=date_status,
            total_present=total_present,
            total_classes=total_classes,
            attendance_percentage=round(percentage, 2)
        ))
    
    students_data.sort(key=lambda x: x.roll_number)
    
    return AttendanceRegisterResponse(
        subject_name=subject.subject_name,
        subject_code=subject.subject_code,
        dates=dates,
        students=students_data
    )

@router.get("/session/{session_id}/records", response_model=List[AttendanceRecordResponse])
async def get_session_attendance_records(
    session_id: int,
    faculty_email: str,
    db: Session = Depends(get_db)
):
    """Get all attendance records for a specific session"""
    
    faculty = db.query(Faculty).filter(Faculty.email == faculty_email).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    session = db.query(AttendanceSession).filter(
        AttendanceSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.faculty_id != faculty.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.session_id == session_id
    ).all()
    
    result = []
    for record in records:
        student = db.query(Student).filter(Student.id == record.student_id).first()
        result.append(AttendanceRecordResponse(
            id=record.id,
            student_name=student.name,
            roll_number=student.roll_number,
            marked_at=record.marked_at,
            photo_path=record.photo_path
        ))
    
    return result