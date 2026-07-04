import sys
from app.database import SessionLocal
from app.models import Faculty, AttendanceSession, AttendanceRecord
from pathlib import Path
import os

def delete_faculty(email):
    db = SessionLocal()
    
    try:
        # Find faculty
        faculty = db.query(Faculty).filter(Faculty.email == email).first()
        
        if not faculty:
            print(f"❌ Faculty not found: {email}")
            return
        
        print(f"🗑️ Deleting faculty: {faculty.name} ({faculty.faculty_id})")
        
        # Get all sessions created by this faculty
        sessions = db.query(AttendanceSession).filter(
            AttendanceSession.faculty_id == faculty.id
        ).all()
        
        session_ids = [session.id for session in sessions]
        
        # Delete attendance records from these sessions
        if session_ids:
            attendance_count = db.query(AttendanceRecord).filter(
                AttendanceRecord.session_id.in_(session_ids)
            ).delete(synchronize_session=False)
            print(f"  • Deleted {attendance_count} attendance records from faculty's sessions")
            
            # Delete attendance photos from these sessions
            attendance_dir = Path("attendance_photos")
            if attendance_dir.exists():
                deleted_photos = 0
                for session_id in session_ids:
                    for photo in attendance_dir.glob(f"*_{session_id}_*"):
                        os.remove(photo)
                        deleted_photos += 1
                if deleted_photos > 0:
                    print(f"  • Deleted {deleted_photos} attendance photos")
        
        # Delete attendance sessions
        session_count = db.query(AttendanceSession).filter(
            AttendanceSession.faculty_id == faculty.id
        ).delete(synchronize_session=False)
        print(f"  • Deleted {session_count} attendance sessions")
        
        # Remove subject assignments
        faculty.subjects.clear()
        print(f"  • Removed subject assignments")
        
        # Delete faculty record
        db.delete(faculty)
        db.commit()
        
        print(f"✅ Faculty deleted successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python delete_faculty.py <email>")
        print("Example: python delete_faculty.py samarthlambture83@gmail.com")
        sys.exit(1)
    
    email = sys.argv[1]
    
    # Confirm deletion
    print(f"⚠️  WARNING: This will delete faculty '{email}' and ALL associated data:")
    print("   - Faculty record")
    print("   - All attendance sessions created by this faculty")
    print("   - All attendance records from these sessions")
    print("   - All attendance photos from these sessions")
    print("   - Subject assignments")
    print()
    confirm = input("Are you sure? Type 'yes' to confirm: ")
    
    if confirm.lower() == 'yes':
        delete_faculty(email)
    else:
        print("❌ Deletion cancelled")