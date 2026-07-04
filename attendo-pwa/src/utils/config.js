// ========================================
// FILE: src/utils/config.js
// ========================================

// Configuration file for API endpoints and app settings

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.5:8000', // Change to your backend IP
  ENDPOINTS: {
    STUDENT_LOGIN: '/api/student/login',
    STUDENT_REGISTER: '/api/student/register',
    VERIFY_OTP: '/api/student/verify-otp',
    RESEND_OTP: '/api/student/resend-otp',
    REGISTER_SUBJECTS: '/api/student/subjects',
    GET_SUBJECTS: (rollNumber) => `/api/student/${rollNumber}/subjects`,
    VERIFY_CODE: '/api/attendance/verify-code',
    MARK_ATTENDANCE: '/api/attendance/mark',
  },
};

export const APP_CONFIG = {
  NAME: 'Attendo',
  VERSION: '1.0.0',
  THEME_COLOR: '#4F46E5',
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
};