import sys
from app.database import SessionLocal
from app.models import Student, AttendanceRecord
from app.utils.face_recognition import get_face_service
from pathlib import Path
import os

def delete_student(email):
    db = SessionLocal()
    
    try:
        # Find student
        student = db.query(Student).filter(Student.email == email).first()
        
        if not student:
            print(f"❌ Student not found: {email}")
            return
        
        print(f"🗑️ Deleting student: {student.name} ({student.roll_number})")
        
        # Delete attendance records
        count = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == student.id
        ).delete()
        print(f"  • Deleted {count} attendance records")
        
        # Remove subject enrollments
        student.subjects.clear()
        print(f"  • Removed subject enrollments")
        
        # Delete photos
        if student.photo_path and Path(student.photo_path).exists():
            os.remove(student.photo_path)
            print(f"  • Deleted registration photo")
        
        # Delete face data
        try:
            face_service = get_face_service()
            db_data = face_service.load_db()
            if student.roll_number in db_data:
                del db_data[student.roll_number]
                face_service.save_db(db_data)
                print(f"  • Deleted face recognition data")
        except:
            pass
        
        # Delete attendance photos
        attendance_dir = Path("attendance_photos")
        if attendance_dir.exists():
            for photo in attendance_dir.glob(f"{student.roll_number}_*"):
                os.remove(photo)
                print(f"  • Deleted attendance photo: {photo.name}")
        
        # Delete student
        db.delete(student)
        db.commit()
        
        print(f"✅ Student deleted successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python delete_student.py <email>")
        print("Example: python delete_student.py CS24B1027@iiitr.ac.in")
        sys.exit(1)
    
    email = sys.argv[1]
    delete_student(email)