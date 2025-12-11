import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const CodeEntryScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scannedCode, subject, rollNumber } = location.state || {};
  
  const [code, setCode] = useState(scannedCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter attendance code');
      return;
    }

    if (!subject) {
      setError('Subject information missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate code with backend
      const validation = await apiService.validateAttendanceCode(
        code.toUpperCase(),
        subject.id
      );

      if (validation.valid) {
        // Code is valid, navigate to attendance form
        navigate('/attendance-form', {
          state: {
            code: code.toUpperCase(),
            subject,
            rollNumber
          }
        });
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid or expired attendance code');
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "40px 30px",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "slideUp 0.5s ease-out"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "40px",
            animation: "scaleIn 0.6s ease-out"
          }}>
            🔢
          </div>
          <h2 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            margin: "0 0 10px 0"
          }}>
            Enter Attendance Code
          </h2>
          {subject && (
            <p style={{
              fontSize: "14px",
              color: "#6B7280",
              margin: 0
            }}>
              {subject.subject_name} - {subject.subject_code}
            </p>
          )}
        </div>

        {error && (
          <div style={{
            padding: "12px",
            background: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "10px",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "30px" }}>
          <input
            type="text"
            placeholder="ATTEND123"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            maxLength={5}
            autoFocus={!scannedCode}
            style={{
              width: "100%",
              padding: "20px",
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "4px",
              textTransform: "uppercase",
              textAlign: "center",
              border: "3px solid #E5E7EB",
              borderRadius: "12px",
              boxSizing: "border-box",
              outline: "none",
              fontFamily: "monospace",
              background: "#F9FAFB"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.background = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB";
              e.target.style.background = "#F9FAFB";
            }}
          />
          <div style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "14px",
            color: "#6B7280"
          }}>
            {code.length}/12 characters
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !code.trim()}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "18px",
            fontWeight: "700",
            color: "white",
            background: loading || !code.trim()
              ? "#9CA3AF"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "12px",
            cursor: loading || !code.trim() ? "not-allowed" : "pointer",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            marginBottom: "15px",
            transition: "all 0.3s ease"
          }}
        >
          {loading ? 'Verifying...' : 'Submit Code'}
        </button>

        <div style={{
          display: "flex",
          gap: "10px"
        }}>
          <button
            onClick={() => navigate("/qr-scanner", { state: { subject, rollNumber } })}
            style={{
              flex: 1,
              padding: "14px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#667eea",
              background: "white",
              border: "2px solid #667eea",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            📷 Scan QR
          </button>
          <button
            onClick={() => navigate("/student-home")}
            style={{
              flex: 1,
              padding: "14px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#6B7280",
              background: "white",
              border: "2px solid #E5E7EB",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>

        <div style={{
          marginTop: "25px",
          padding: "16px",
          background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
          borderRadius: "12px",
          fontSize: "14px",
          color: "#92400E",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <span style={{ fontSize: "20px" }}>💡</span>
          <span>
            Enter the attendance code displayed by your faculty
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CodeEntryScreen;