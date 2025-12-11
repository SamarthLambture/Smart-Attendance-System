// API Service for Attendo Frontend
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  // Send OTP
  async sendOTP(email, userType, purpose) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          user_type: userType,
          purpose,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      console.error('Send OTP Error:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otpCode, userType) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          user_type: userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid OTP');
      }

      return data;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error;
    }
  }

  // Register Student
  async registerStudent(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
        method: 'POST',
        body: formData, // FormData object with photo
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Register Student Error:', error);
      throw error;
    }
  }

  // Register Faculty
  async registerFaculty(facultyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/faculty/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facultyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Register Faculty Error:', error);
      throw error;
    }
  }

  // Student Login
  async loginStudent(email) {
    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Student Login Error:', error);
      throw error;
    }
  }

  // Faculty Login
  async loginFaculty(email) {
    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await fetch(`${API_BASE_URL}/auth/faculty/login`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Faculty Login Error:', error);
      throw error;
    }
  }

  // Get Student Profile
  async getStudentProfile(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/student/profile/${email}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get Student Profile Error:', error);
      throw error;
    }
  }

  // Get Faculty Profile
  async getFacultyProfile(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/faculty/profile/${email}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get Faculty Profile Error:', error);
      throw error;
    }
  }

  // Get All Subjects by Branch (all semesters/years)
  async getSubjectsByBranch(branch) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/branch/${branch}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch subjects');
      }

      return data;
    } catch (error) {
      console.error('Get Subjects Error:', error);
      throw error;
    }
  }

  // Get Subjects by Branch and Semester (kept for compatibility)
  async getSubjectsByBranchSemester(branch, semester) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/branch/${branch}/semester/${encodeURIComponent(semester)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch subjects');
      }

      return data;
    } catch (error) {
      console.error('Get Subjects Error:', error);
      throw error;
    }
  }

  // Get Student Enrolled Subjects
  async getStudentSubjects(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/student/${email}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch student subjects');
      }

      return data;
    } catch (error) {
      console.error('Get Student Subjects Error:', error);
      throw error;
    }
  }

  // Enroll Student in Subjects
  async enrollStudentSubjects(studentEmail, subjectIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/student/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_email: studentEmail,
          subject_ids: subjectIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to enroll subjects');
      }

      return data;
    } catch (error) {
      console.error('Enroll Subjects Error:', error);
      throw error;
    }
  }

  // Get All Subjects (for faculty - all branches, all semesters)
  async getAllSubjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch subjects');
      }

      return data;
    } catch (error) {
      console.error('Get All Subjects Error:', error);
      throw error;
    }
  }

  // Get Faculty Assigned Subjects
  async getFacultySubjects(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/faculty/${email}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch faculty subjects');
      }

      return data;
    } catch (error) {
      console.error('Get Faculty Subjects Error:', error);
      throw error;
    }
  }

  // Assign Subjects to Faculty
  async assignFacultySubjects(facultyEmail, subjectIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/faculty/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faculty_email: facultyEmail,
          subject_ids: subjectIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to assign subjects');
      }

      return data;
    } catch (error) {
      console.error('Assign Subjects Error:', error);
      throw error;
    }
  }
}

export default new ApiService();