import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";


const EnhancedStudentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.rollNumber) {
      setError("Please fill in all fields");
      return;
    }

    // Validate email format (institute email)
    const emailRegex = /^[a-z]{2}\d{2}b\d{1,4}@iiitr\.ac\.in$/i;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid institute email (e.g., cs24b1027@iiitr.ac.in)");
      return;
    }

    setLoading(true);
    
    try {
      // Send OTP via API
      await apiService.sendOTP(formData.email, 'student', 'login');
      
      // Store user data temporarily in sessionStorage
      sessionStorage.setItem("temp_student_data", JSON.stringify({
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber
      }));
      
      // Navigate to OTP verification
      navigate("/verify-otp", {
        state: {
          name: formData.name,
          email: formData.email,
          rollNumber: formData.rollNumber,
          isRegistration: false
        }
      });
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(102,126,234,0.02) 50px, rgba(102,126,234,0.02) 51px),
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(102,126,234,0.02) 50px, rgba(102,126,234,0.02) 51px)
        `,
        animation: 'gridFlow 20s linear infinite'
      }} />

      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${i === 0 ? 'rgba(102,126,234,0.15)' : 'rgba(118,75,162,0.15)'} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            left: `${i * 40}%`,
            top: `${i * 30}%`,
            animation: `float ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`
          }}
        />
      ))}

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '450px',
        animation: 'slideUp 0.6s ease-out'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '30px',
          padding: '40px',
          boxShadow: '0 30px 90px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 30px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 15px 40px rgba(102,126,234,0.5)',
            animation: 'scaleIn 0.6s ease-out'
          }}>
            👤
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: 'white',
            textAlign: 'center',
            margin: '0 0 10px 0'
          }}>
            Student Login
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            margin: '0 0 35px 0'
          }}>
            Enter your details to continue
          </p>

          {error && (
            <div style={{
              padding: '15px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '15px',
              color: '#FCA5A5',
              marginBottom: '25px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '10px'
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                background: focusedField === 'name' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${focusedField === 'name' ? '#667eea' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '15px',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                boxShadow: focusedField === 'name' ? '0 0 0 4px rgba(102,126,234,0.1)' : 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '10px'
            }}>
              Institute Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="cs24b1027@iiitr.ac.in"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                background: focusedField === 'email' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${focusedField === 'email' ? '#667eea' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '15px',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(102,126,234,0.1)' : 'none'
              }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
              Format: &lt;branch&gt;&lt;year&gt;b&lt;number&gt;@iiitr.ac.in
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '10px'
            }}>
              Roll Number
            </label>
            <input
              type="text"
              name="rollNumber"
              placeholder="Enter your roll number"
              value={formData.rollNumber}
              onChange={handleChange}
              onFocus={() => setFocusedField('rollNumber')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                background: focusedField === 'rollNumber' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${focusedField === 'rollNumber' ? '#667eea' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '15px',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                boxShadow: focusedField === 'rollNumber' ? '0 0 0 4px rgba(102,126,234,0.1)' : 'none'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              background: loading ? 'rgba(102,126,234,0.5)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 10px 30px rgba(102,126,234,0.4)',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Don't have an account? </span>
            <span style={{ color: '#667eea', fontWeight: '600', cursor: 'pointer' }} 
              onClick={() => navigate("/student-register")}
            >
              Register here
            </span>
          </div>

          <button
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate("/user-selection")}
          >
            Back
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes gridFlow {
          from { transform: translateY(0); }
          to { transform: translateY(50px); }
        }
        input::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
};

export default EnhancedStudentLogin;