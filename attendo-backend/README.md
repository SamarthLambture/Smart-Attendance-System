# Attendo Backend API

Smart Attendance Management System with OTP-based authentication for students and faculty.

## Features

✅ **Student Registration & Login**
- Institute email validation (`@iiitr.ac.in`)
- Email format validation (CS24B1027, AD23B1026, MC25B1028)
- Live photo capture and storage
- OTP-based email verification

✅ **Faculty Registration & Login**
- Faculty ID-based registration
- Department and designation management
- OTP-based email verification

✅ **Security**
- OTP expiration (10 minutes)
- Email validation
- Secure password hashing (ready for future implementation)

✅ **Database**
- PostgreSQL with SQLAlchemy ORM
- Proper relationship modeling
- Automatic table creation

## Quick Start

### 1. Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Setup PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE attendo_db;
CREATE USER attendo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE attendo_db TO attendo_user;
\q
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run Server
```bash
uvicorn app.main:app --reload
```

### 5. Test API
Visit: http://localhost:8000/docs

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/student/register` | Register new student |
| POST | `/api/auth/faculty/register` | Register new faculty |
| POST | `/api/auth/student/login` | Student login |
| POST | `/api/auth/faculty/login` | Faculty login |
| GET | `/api/auth/student/profile/{email}` | Get student profile |
| GET | `/api/auth/faculty/profile/{email}` | Get faculty profile |

## Email Validation Rules

### Student Email Format
- Pattern: `<branch><year>b<number>@iiitr.ac.in`
- Valid branches: `CS`, `AD`, `MC`
- Examples:
  - `cs24b1027@iiitr.ac.in` ✅
  - `ad23b1026@iiitr.ac.in` ✅
  - `mc25b1028@iiitr.ac.in` ✅

### Branch Codes
- `CS` - Computer Science & Engineering
- `AD` - Artificial Intelligence & Data Science
- `MC` - Mathematics & Computing

## Registration Flow

### Student Registration
1. Enter details (name, email, roll number, branch, year)
2. Capture live photo
3. Request OTP → `POST /api/auth/send-otp`
4. Verify OTP → `POST /api/auth/verify-otp`
5. Complete registration → `POST /api/auth/student/register`

### Faculty Registration
1. Enter details (name, faculty ID, email, department, designation)
2. Request OTP → `POST /api/auth/send-otp`
3. Verify OTP → `POST /api/auth/verify-otp`
4. Complete registration → `POST /api/auth/faculty/register`

## Login Flow

### Student Login
1. Enter email
2. Request OTP → `POST /api/auth/send-otp` (purpose: "login")
3. Verify OTP → `POST /api/auth/verify-otp`
4. Login → `POST /api/auth/student/login`

### Faculty Login
1. Enter email
2. Request OTP → `POST /api/auth/send-otp` (purpose: "login")
3. Verify OTP → `POST /api/auth/verify-otp`
4. Login → `POST /api/auth/faculty/login`

## Database Schema

### Tables
- `students` - Student information
- `faculty` - Faculty information
- `subjects` - Subject details
- `attendance_sessions` - Active attendance sessions
- `attendance_records` - Student attendance records
- `otps` - OTP verification codes
- `student_subjects` - Many-to-many relationship
- `faculty_subjects` - Many-to-many relationship

## Project Structure

```
attendo-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   └── auth.py          # Authentication routes
│   └── utils/
│       ├── __init__.py
│       └── email.py         # Email utilities
├── photos/                   # Permanent photo storage
├── temp_photos/             # Temporary photo storage
├── .env                     # Environment variables
├── .gitignore
├── requirements.txt
├── README.md
└── SETUP_GUIDE.md
```

## Testing

Run the test script:
```bash
python test_api.py
```

Or use the interactive API docs:
```
http://localhost:8000/docs
```

## Gmail Setup for OTP

1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use the 16-character password in `.env` file

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost/attendo_db
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000
```

## Security Notes

- ⚠️ Never commit `.env` file
- ⚠️ Use strong SECRET_KEY
- ⚠️ Enable HTTPS in production
- ⚠️ Implement rate limiting for OTP requests

## Future Enhancements

- [ ] JWT token-based authentication
- [ ] QR code generation for attendance
- [ ] Real-time attendance tracking
- [ ] Geolocation validation
- [ ] Analytics dashboard
- [ ] Export attendance reports
- [ ] Push notifications

## License

MIT

## Support

For issues and questions, please create an issue in the repository.