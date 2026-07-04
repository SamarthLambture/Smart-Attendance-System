// API Service for Attendo Frontend
// const API_BASE_URL = 'http://localhost:8000/api';
// const API_BASE_URL = 'http://192.168.0.102:8000';

// Automatically detect environment
const getApiBaseUrl = () => {
  // Check if running on localhost (laptop)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  
  // If accessing via IP (phone), use the same IP for API
  const hostname = window.location.hostname;
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  // ========== AUTH ENDPOINTS ==========
  
  async sendOTP(email, userType, purpose) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          user_type: userType,
          purpose,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to send OTP');
      return data;
    } catch (error) {
      console.error('Send OTP Error:', error);
      throw error;
    }
  }

  async verifyOTP(email, otpCode, userType) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          user_type: userType,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Invalid OTP');
      return data;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error;
    }
  }

  async registerStudent(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');
      return data;
    } catch (error) {
      console.error('Register Student Error:', error);
      throw error;
    }
  }

  async registerFaculty(facultyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/faculty/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Registration failed');
      return data;
    } catch (error) {
      console.error('Register Faculty Error:', error);
      throw error;
    }
  }

  async loginStudent(email) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');
      return data;
    } catch (error) {
      console.error('Student Login Error:', error);
      throw error;
    }
  }

  async loginFaculty(email) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      const response = await fetch(`${API_BASE_URL}/auth/faculty/login`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');
      return data;
    } catch (error) {
      console.error('Faculty Login Error:', error);
      throw error;
    }
  }

  async getStudentProfile(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/profile/${email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch profile');
      return data;
    } catch (error) {
      console.error('Get Student Profile Error:', error);
      throw error;
    }
  }

  async getFacultyProfile(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/faculty/profile/${email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch profile');
      return data;
    } catch (error) {
      console.error('Get Faculty Profile Error:', error);
      throw error;
    }
  }

  // ========== SUBJECT ENDPOINTS ==========

  async getSubjectsByBranch(branch) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/branch/${branch}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch subjects');
      return data;
    } catch (error) {
      console.error('Get Subjects Error:', error);
      throw error;
    }
  }

  async getSubjectsByBranchSemester(branch, semester) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/branch/${branch}/semester/${encodeURIComponent(semester)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch subjects');
      return data;
    } catch (error) {
      console.error('Get Subjects Error:', error);
      throw error;
    }
  }

  async getStudentSubjects(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/student/${email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch student subjects');
      return data;
    } catch (error) {
      console.error('Get Student Subjects Error:', error);
      throw error;
    }
  }

  async enrollStudentSubjects(studentEmail, subjectIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/student/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: studentEmail,
          subject_ids: subjectIds,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to enroll subjects');
      return data;
    } catch (error) {
      console.error('Enroll Subjects Error:', error);
      throw error;
    }
  }

  async getAllSubjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/all`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch subjects');
      return data;
    } catch (error) {
      console.error('Get All Subjects Error:', error);
      throw error;
    }
  }

  async getFacultySubjects(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/faculty/${email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch faculty subjects');
      return data;
    } catch (error) {
      console.error('Get Faculty Subjects Error:', error);
      throw error;
    }
  }

  async assignFacultySubjects(facultyEmail, subjectIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/faculty/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_email: facultyEmail,
          subject_ids: subjectIds,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to assign subjects');
      return data;
    } catch (error) {
      console.error('Assign Subjects Error:', error);
      throw error;
    }
  }

  // ========== ATTENDANCE ENDPOINTS ==========

  async createAttendanceSession(facultyEmail, subjectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_email: facultyEmail,
          subject_id: subjectId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to create session');
      return data;
    } catch (error) {
      console.error('Create Session Error:', error);
      throw error;
    }
  }

  async validateAttendanceCode(sessionCode, subjectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_code: sessionCode,
          subject_id: subjectId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Invalid code');
      return data;
    } catch (error) {
      console.error('Validate Code Error:', error);
      throw error;
    }
  }

  async markAttendance(sessionCode, subjectId, studentEmail, photo) {
    try {
      const formData = new FormData();
      formData.append('session_code', sessionCode);
      formData.append('subject_id', subjectId);
      formData.append('student_email', studentEmail);
      formData.append('photo', photo, 'photo.png');

      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to mark attendance');
      return data;
    } catch (error) {
      console.error('Mark Attendance Error:', error);
      throw error;
    }
  }

  async getAttendanceStats(studentEmail, subjectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/stats/${studentEmail}/${subjectId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch stats');
      return data;
    } catch (error) {
      console.error('Get Attendance Stats Error:', error);
      throw error;
    }
  }

  async getAttendanceRegister(subjectId, facultyEmail) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/register/${subjectId}?faculty_email=${facultyEmail}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch register');
      return data;
    } catch (error) {
      console.error('Get Attendance Register Error:', error);
      throw error;
    }
  }

  async getSessionRecords(sessionId, facultyEmail) {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/session/${sessionId}/records?faculty_email=${facultyEmail}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to fetch records');
      return data;
    } catch (error) {
      console.error('Get Session Records Error:', error);
      throw error;
    }
  }
}

export default new ApiService();