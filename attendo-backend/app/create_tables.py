"""
Database initialization and migration script
Run this after updating models to create/update tables
"""

from app.database import engine, Base
from app.models import (
    Student, Faculty, Subject, AttendanceSession, 
    AttendanceRecord, OTP, student_subjects, faculty_subjects, FaceEmbedding
)

def init_db():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    init_db()
