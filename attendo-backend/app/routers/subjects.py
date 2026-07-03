from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Subject, Student, Faculty, student_subjects, faculty_subjects
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

# Schemas
class SubjectResponse(BaseModel):
    id: int
    subject_code: str
    subject_name: str
    branch: str
    semester: str
    
    class Config:
        from_attributes = True

class SubjectSelectionRequest(BaseModel):
    student_email: str
    subject_ids: List[int]

class FacultySubjectSelectionRequest(BaseModel):
    faculty_email: str
    subject_ids: List[int]

class MessageResponse(BaseModel):
    message: str
    success: bool = True

@router.get("/branch/{branch}", response_model=List[SubjectResponse])
async def get_subjects_by_branch(
    branch: str,
    db: Session = Depends(get_db)
):
    """
    Get ALL subjects for a branch (all semesters/years)
    Branch: CS, AD, MC
    """
    
    # Map branch codes to full names
    branch_mapping = {
        "CS": "Computer Science & Engineering",
        "AD": "Artificial Intelligence & Data Science",
        "MC": "Mathematics & Computing"
    }
    
    if branch not in branch_mapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid branch code. Must be one of: CS, AD, MC"
        )
    
    full_branch_name = branch_mapping[branch]
    
    # Get all subjects for this branch, ordered by semester
    subjects = db.query(Subject).filter(
        Subject.branch == full_branch_name
    ).order_by(Subject.semester, Subject.subject_code).all()
    
    return subjects

@router.get("/branch/{branch}/semester/{semester}", response_model=List[SubjectResponse])
async def get_subjects_by_branch_semester(
    branch: str,
    semester: str,
    db: Session = Depends(get_db)
):
    """
    Get subjects filtered by branch and semester (kept for compatibility)
    Branch: CS, AD, MC
    Semester: 1st Semester, 2nd Semester, etc.
    """
    
    # Map branch codes to full names
    branch_mapping = {
        "CS": "Computer Science & Engineering",
        "AD": "Artificial Intelligence & Data Science",
        "MC": "Mathematics & Computing"
    }
    
    if branch not in branch_mapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid branch code. Must be one of: CS, AD, MC"
        )
    
    full_branch_name = branch_mapping[branch]
    
    subjects = db.query(Subject).filter(
        Subject.branch == full_branch_name,
        Subject.semester == semester
    ).all()
    
    return subjects

@router.get("/student/{email}", response_model=List[SubjectResponse])
async def get_student_subjects(
    email: str,
    db: Session = Depends(get_db)
):
    """Get subjects enrolled by a student"""
    
    student = db.query(Student).filter(Student.email == email).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student.subjects

@router.post("/student/enroll", response_model=MessageResponse)
async def enroll_student_subjects(
    request: SubjectSelectionRequest,
    db: Session = Depends(get_db)
):
    """Enroll student in selected subjects"""
    
    # Find student
    student = db.query(Student).filter(Student.email == request.student_email).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Clear existing enrollments
    student.subjects.clear()
    
    # Get selected subjects
    subjects = db.query(Subject).filter(Subject.id.in_(request.subject_ids)).all()
    
    if len(subjects) != len(request.subject_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some subjects not found"
        )
    
    # Enroll student in subjects
    student.subjects.extend(subjects)
    
    db.commit()
    
    return MessageResponse(
        message=f"Successfully enrolled in {len(subjects)} subjects",
        success=True
    )

@router.get("/all", response_model=List[SubjectResponse])
async def get_all_subjects(db: Session = Depends(get_db)):
    """Get all subjects (admin/debug use)"""
    subjects = db.query(Subject).order_by(Subject.branch, Subject.semester).all()
    return subjects

@router.get("/faculty/{email}", response_model=List[SubjectResponse])
async def get_faculty_subjects(
    email: str,
    db: Session = Depends(get_db)
):
    """Get subjects assigned to a faculty"""
    
    faculty = db.query(Faculty).filter(Faculty.email == email).first()
    
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    return faculty.subjects

@router.post("/faculty/assign", response_model=MessageResponse)
async def assign_faculty_subjects(
    request: FacultySubjectSelectionRequest,
    db: Session = Depends(get_db)
):
    """Assign subjects to faculty"""
    
    # Find faculty
    faculty = db.query(Faculty).filter(Faculty.email == request.faculty_email).first()
    
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    # Clear existing assignments
    faculty.subjects.clear()
    
    # Get selected subjects
    subjects = db.query(Subject).filter(Subject.id.in_(request.subject_ids)).all()
    
    if len(subjects) != len(request.subject_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some subjects not found"
        )
    
    # Assign subjects to faculty
    faculty.subjects.extend(subjects)
    
    db.commit()
    
    return MessageResponse(
        message=f"Successfully assigned {len(subjects)} subjects",
        success=True
    )