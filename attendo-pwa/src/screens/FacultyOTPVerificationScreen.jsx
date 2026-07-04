import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

const FacultyOTPVerificationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, facultyId, email, isRegistration } = location.state || {};
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Verify OTP via API
      await apiService.verifyOTP(email, otp, 'faculty');
      
      if (isRegistration) {
        // For registration, store data and navigate to subject selection
        const tempData = sessionStorage.getItem('temp_faculty_data');
        if (tempData) {
          const facultyData = JSON.parse(tempData);
          localStorage.setItem('faculty_data', JSON.stringify(facultyData));
          localStorage.setItem('faculty_id', facultyData.facultyId);
          localStorage.setItem('faculty_name', facultyData.name);
          localStorage.setItem('is_faculty_logged_in', 'true');
          sessionStorage.removeItem('temp_faculty_data');
        }
        
        navigate("/faculty-select-subjects", {
          state: { name, facultyId },
        });
      } else {
        // For login, fetch faculty data from API
        const facultyData = await apiService.loginFaculty(email);
        
        // Store in localStorage
        localStorage.setItem('faculty_data', JSON.stringify(facultyData));
        localStorage.setItem('faculty_id', facultyData.faculty_id);
        localStorage.setItem('faculty_name', facultyData.name);
        localStorage.setItem('is_faculty_logged_in', 'true');
        
        // Clear temp data
        sessionStorage.removeItem('temp_faculty_data');
        
        navigate("/faculty-home");
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendLoading(true);
    
    try {
      await apiService.sendOTP(
        email, 
        'faculty', 
        isRegistration ? 'registration' : 'login'
      );
      alert("OTP resent successfully! Please check your email.");
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="card slide-up">
        <div className="icon-container" style={{ margin: "0 auto 20px", background: "#D1FAE5" }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              fill="#10B981"
            />
          </svg>
        </div>

        <h2 className="title">Verify OTP</h2>
        <p className="subtitle">Enter the code sent to</p>
        <p style={{ 
          fontSize: '14px', 
          color: '#4F46E5',
          fontWeight: '600',
          textAlign: 'center',
          marginTop: '5px',
          marginBottom: '10px'
        }}>
          {email}
        </p>
        <p style={{ 
          fontSize: "12px", 
          color: "#9CA3AF", 
          textAlign: "center",
          marginTop: "8px" 
        }}>
          Check your email inbox for the OTP
        </p>

        {error && (
          <div className="error-message" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Enter OTP</label>
          <input
            type="text"
            className="input-field"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            maxLength={6}
            style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
            autoFocus
          />
          <div style={{ 
            textAlign: "center", 
            marginTop: "8px", 
            fontSize: "14px",
            color: "#6B7280" 
          }}>
            {otp.length}/6 digits
          </div>
        </div>

        <button
          className="btn btn-success"
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span 
            className="link" 
            onClick={handleResend}
            style={{ 
              opacity: resendLoading ? 0.5 : 1,
              pointerEvents: resendLoading ? 'none' : 'auto'
            }}
          >
            {resendLoading ? 'Sending...' : 'Resend OTP'}
          </span>
        </div>

        <button
          className="btn btn-white"
          onClick={() => navigate(isRegistration ? "/faculty-register" : "/faculty-login")}
          style={{ marginTop: "15px" }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default FacultyOTPVerificationScreen;