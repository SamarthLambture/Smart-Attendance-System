import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const OTPVerificationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, rollNumber, email, isRegistration } = location.state || {};
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await apiService.verifyOTP(email, otp, 'student');
      
      if (isRegistration) {
        const tempData = sessionStorage.getItem('temp_student_data');
        if (tempData) {
          const userData = JSON.parse(tempData);
          localStorage.setItem('user_data', JSON.stringify(userData));
          localStorage.setItem('roll_number', userData.rollNumber);
          localStorage.setItem('student_name', userData.name);
          localStorage.setItem('is_logged_in', 'true');
          sessionStorage.removeItem('temp_student_data');
        }
        
        navigate('/select-subjects', {
          state: { name, rollNumber },
        });
      } else {
        const userData = await apiService.loginStudent(email);
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('roll_number', userData.roll_number);
        localStorage.setItem('student_name', userData.name);
        localStorage.setItem('is_logged_in', 'true');
        sessionStorage.removeItem('temp_student_data');
        navigate('/student-home');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendLoading(true);
    
    try {
      await apiService.sendOTP(
        email, 
        'student', 
        isRegistration ? 'registration' : 'login'
      );
      alert('OTP resent successfully! Please check your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(102,126,234,${Math.random() * 0.1}) 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.6s ease-out'
      }}>
        {/* Main Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '40px 30px',
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Icon Container */}
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 30px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(16,185,129,0.3)',
            boxShadow: '0 0 40px rgba(16,185,129,0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                fill="#10B981"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Verify OTP
          </h2>

          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            marginBottom: '8px'
          }}>
            Enter the code sent to
          </p>

          <p style={{
            fontSize: '15px',
            color: '#10B981',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '10px',
            wordBreak: 'break-all',
            padding: '0 10px'
          }}>
            {email}
          </p>

          <p style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Check your email inbox for the OTP
          </p>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '15px',
              color: '#FCA5A5',
              marginBottom: '25px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              animation: 'shake 0.5s ease-in-out'
            }}>
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              maxLength={6}
              autoFocus
              style={{
                width: '100%',
                padding: '20px',
                fontSize: '32px',
                fontWeight: '700',
                textAlign: 'center',
                letterSpacing: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                color: '#ffffff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.2), inset 0 2px 10px rgba(0, 0, 0, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.3)';
              }}
            />
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '500'
            }}>
              {otp.length}/6 digits
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%',
              padding: '18px',
              background: loading || otp.length !== 6
                ? 'rgba(102, 126, 234, 0.3)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading || otp.length !== 6
                ? 'none'
                : '0 10px 30px rgba(102, 126, 234, 0.4)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (otp.length === 6 && !loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = loading || otp.length !== 6 ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)';
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Verifying...
              </>
            ) : 'Verify & Continue'}
          </button>

          {/* Resend OTP */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span
              onClick={resendLoading ? null : handleResend}
              style={{
                color: resendLoading ? 'rgba(102, 126, 234, 0.5)' : '#667eea',
                fontWeight: '600',
                cursor: resendLoading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                textDecoration: 'underline',
                transition: 'all 0.3s ease'
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </span>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(isRegistration ? '/student-register' : '/student-login')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Back
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default OTPVerificationScreen;