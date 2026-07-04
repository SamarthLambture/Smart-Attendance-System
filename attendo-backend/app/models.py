from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Association table for student-subject many-to-many relationship
student_subjects = Table(
    'student_subjects',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('subject_id', Integer, ForeignKey('subjects.id'))
)

# Association table for faculty-subject many-to-many relationship
faculty_subjects = Table(
    'faculty_subjects',
    Base.metadata,
    Column('faculty_id', Integer, ForeignKey('faculty.id')),
    Column('subject_id', Integer, ForeignKey('subjects.id'))
)

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    branch = Column(String, nullable=False)
    year = Column(String, nullable=False)
    photo_path = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subjects = relationship("Subject", secondary=student_subjects, back_populates="students")
    attendance_records = relationship("AttendanceRecord", back_populates="student")

class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subjects = relationship("Subject", secondary=faculty_subjects, back_populates="faculty")
    attendance_sessions = relationship("AttendanceSession", back_populates="faculty")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_code = Column(String, nullable=False, index=True)
    subject_name = Column(String, nullable=False)
    branch = Column(String, nullable=False)
    semester = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    students = relationship("Student", secondary=student_subjects, back_populates="subjects")
    faculty = relationship("Faculty", secondary=faculty_subjects, back_populates="subjects")
    attendance_sessions = relationship("AttendanceSession", back_populates="subject")

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    session_code = Column(String, unique=True, nullable=False, index=True)  # The attendance code
    qr_data = Column(String, nullable=False)  # QR code data (same as session_code)
    date = Column(DateTime, default=datetime.utcnow)  # Session date
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    # Relationships
    faculty = relationship("Faculty", back_populates="attendance_sessions")
    subject = relationship("Subject", back_populates="attendance_sessions")
    attendance_records = relationship("AttendanceRecord", back_populates="session")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("attendance_sessions.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)  # Direct reference
    marked_at = Column(DateTime, default=datetime.utcnow)
    photo_path = Column(String, nullable=False)  # Path to attendance photo
    is_valid = Column(Boolean, default=True)
    
    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    session = relationship("AttendanceSession", back_populates="attendance_records")

class OTP(Base):
    __tablename__ = "otps"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    otp_code = Column(String, nullable=False)
    user_type = Column(String, nullable=False)  # 'student' or 'faculty'
    purpose = Column(String, nullable=False)  # 'registration' or 'login'
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)