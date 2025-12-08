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
}

export default new ApiService();