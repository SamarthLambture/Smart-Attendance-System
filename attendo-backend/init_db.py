"""
Database initialization script for Attendo
Run this script to create all database tables
"""

from app.database import engine, Base
from app.models import (
    Student, Faculty, Subject, 
    AttendanceSession, AttendanceRecord, OTP,
    student_subjects, faculty_subjects
)
import os

def init_database():
    """Initialize database tables"""
    print("="*60)
    print("ATTENDO DATABASE INITIALIZATION")
    print("="*60)
    
    print("\n📊 Creating database tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("\n✅ Database tables created successfully!")
        print("\nCreated tables:")
        print("  - students")
        print("  - faculty")
        print("  - subjects")
        print("  - attendance_sessions")
        print("  - attendance_records")
        print("  - otps")
        print("  - student_subjects (association table)")
        print("  - faculty_subjects (association table)")
        
        # Create photo directories
        print("\n📁 Creating photo directories...")
        os.makedirs("photos", exist_ok=True)
        os.makedirs("temp_photos", exist_ok=True)
        print("  ✅ photos/")
        print("  ✅ temp_photos/")
        
        print("\n" + "="*60)
        print("✨ DATABASE INITIALIZATION COMPLETE!")
        print("="*60)
        print("\nNext steps:")
        print("1. Start the server: uvicorn app.main:app --reload")
        print("2. Visit: http://localhost:8000/docs")
        print("3. Test the API endpoints")
        
    except Exception as e:
        print(f"\n❌ Error creating tables: {str(e)}")
        print("\nPlease check:")
        print("1. PostgreSQL is running")
        print("2. Database credentials in .env are correct")
        print("3. Database exists and user has permissions")
        return False
    
    return True

def check_connection():
    """Check database connection"""
    print("\n🔍 Checking database connection...")
    
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        
        # Try a simple query
        db.execute("SELECT 1")
        db.close()
        
        print("✅ Database connection successful!")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("\nPlease verify:")
        print("1. PostgreSQL service is running")
        print("2. DATABASE_URL in .env is correct")
        print("3. Database and user exist")
        print("4. User has proper permissions")
        return False

def main():
    """Main initialization function"""
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("❌ .env file not found!")
        print("\nPlease create .env file with the following variables:")
        print("DATABASE_URL=postgresql://user:password@localhost/attendo_db")
        print("MAIL_USERNAME=your-email@gmail.com")
        print("MAIL_PASSWORD=your-app-password")
        print("SECRET_KEY=your-secret-key")
        return
    
    # Check database connection
    if not check_connection():
        return
    
    # Initialize database
    init_database()

if __name__ == "__main__":
    main()