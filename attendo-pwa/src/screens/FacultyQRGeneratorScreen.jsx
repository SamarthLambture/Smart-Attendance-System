import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

const FacultyQRGeneratorScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject } = location.state || {};

  const [attendanceCode, setAttendanceCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(240); // 1 minute = 60 seconds
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let isSubscribed = true; // Prevent double calls
    
    if (!subject) {
      navigate("/faculty-home");
      return;
    }
    
    // Only create session if flag is true
    if (isSubscribed) {
      createSession();
    }
    
    return () => {
      isSubscribed = false; // Cleanup
    };
  }, []);

  const createSession = async () => {
    try {
      setLoading(true);
      setError("");
      
      const facultyData = JSON.parse(localStorage.getItem("faculty_data") || "{}");
      
      if (!facultyData.email) {
        throw new Error("Faculty email not found");
      }

      // Create attendance session via API
      const response = await apiService.createAttendanceSession(
        facultyData.email,
        subject.id
      );

      setSessionId(response.session_id);
      setAttendanceCode(response.session_code);
      
      // Generate QR code URL using API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${response.session_code}`;
      setQrCodeUrl(qrUrl);
      
      setLoading(false);

      // Start countdown timer (60 seconds)
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExpired(true);
            // Auto redirect after expiry
            setTimeout(() => {
              navigate("/faculty-home");
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } catch (err) {
      console.error("Create session error:", err);
      setError(err.message || "Failed to create attendance session");
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/faculty-home");
  };

  const getTimerColor = () => {
    if (timeRemaining > 40) return "#10B981";
    if (timeRemaining > 20) return "#F59E0B";
    return "#EF4444";
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px"
      }}>
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "400px"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "5px solid #E5E7EB",
            borderTop: "5px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p style={{ fontSize: "18px", color: "#374151" }}>
            Generating QR Code...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px"
      }}>
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "450px"
        }}>
          <div style={{
            width: "100px",
            height: "100px",
            background: "#FEE2E2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 25px",
            fontSize: "48px"
          }}>
            ❌
          </div>
          <h2 style={{ fontSize: "24px", color: "#EF4444", marginBottom: "15px" }}>
            Error
          </h2>
          <p style={{ color: "#6B7280", marginBottom: "25px" }}>
            {error}
          </p>
          <button
            onClick={() => navigate("/faculty-home")}
            style={{
              width: "100%",
              padding: "16px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px"
      }}>
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "450px",
          animation: "scaleIn 0.6s ease-out"
        }}>
          <div style={{
            width: "100px",
            height: "100px",
            background: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 25px",
            fontSize: "48px",
            animation: "scaleIn 0.6s ease-out"
          }}>
            ⏱️
          </div>
          <h1 style={{ 
            fontSize: "28px",
            fontWeight: "700",
            color: "#EF4444",
            marginBottom: "15px"
          }}>
            Code Expired!
          </h1>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            The attendance code has expired. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <button
          onClick={handleClose}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          ← Back to Home
        </button>

        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "slideUp 0.5s ease-out",
          textAlign: "center"
        }}>
          {/* Timer Circle */}
          <div style={{
            width: "120px",
            height: "120px",
            margin: "0 auto 30px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${getTimerColor()} 0%, ${getTimerColor()}dd 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            boxShadow: `0 10px 40px ${getTimerColor()}40`,
            animation: timeRemaining <= 10 ? "pulse 1s ease-in-out infinite" : "scaleIn 0.6s ease-out",
            border: "4px solid white",
            position: "relative"
          }}>
            <div style={{
              fontSize: "42px",
              fontWeight: "700",
              color: "white",
              lineHeight: "1"
            }}>
              {timeRemaining}
            </div>
            <div style={{
              fontSize: "12px",
              color: "white",
              opacity: 0.9,
              marginTop: "4px",
              fontWeight: "600"
            }}>
              seconds
            </div>
          </div>

          <h2 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "10px"
          }}>
            Scan QR Code
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#6B7280",
            marginBottom: "20px"
          }}>
            {subject?.subject_name} ({subject?.subject_code})
          </p>

          {/* QR Code Display */}
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "25px",
            display: "inline-block",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            animation: "scaleIn 0.7s ease-out 0.2s backwards"
          }}>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              style={{
                width: "280px",
                height: "280px",
                display: "block"
              }}
            />
          </div>

          {/* Attendance Code Display */}
          <div style={{
            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "25px",
            animation: "slideUp 0.6s ease-out 0.3s backwards",
            boxShadow: "inset 0 2px 10px rgba(102, 126, 234, 0.1)"
          }}>
            <div style={{
              fontSize: "14px",
              color: "#6B7280",
              marginBottom: "10px",
              fontWeight: "500"
            }}>
              Attendance Code
            </div>
            <div style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#4F46E5",
              letterSpacing: "8px",
              fontFamily: "monospace"
            }}>
              {attendanceCode}
            </div>
            <div style={{
              fontSize: "12px",
              color: "#6B7280",
              marginTop: "10px"
            }}>
              Students can also enter this code manually
            </div>
          </div>

          {/* Warning Box */}
          <div style={{
            background: timeRemaining <= 10
              ? "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"
              : "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "14px",
            color: timeRemaining <= 10 ? "#DC2626" : "#92400E",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideUp 0.6s ease-out 0.4s backwards"
          }}>
            <span style={{ fontSize: "20px" }}>
              {timeRemaining <= 10 ? "⚠️" : "💡"}
            </span>
            <div style={{ textAlign: "left" }}>
              {timeRemaining <= 10 ? (
                <strong>Code expiring soon! Students must mark attendance now.</strong>
              ) : (
                <span>This code will expire in <strong>{timeRemaining} seconds</strong></span>
              )}
            </div>
          </div>

          {/* View Records Button */}
          {sessionId && (
            <button
              onClick={() => navigate("/faculty-session-records", { 
                state: { sessionId, subject } 
              })}
              style={{
                width: "100%",
                padding: "14px",
                background: "white",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "15px"
              }}
            >
              📊 View Attendance Records
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              width: "100%",
              padding: "14px",
              background: "#F3F4F6",
              color: "#374151",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "15px"
            }}
          >
            Close & End Session
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
export default FacultyQRGeneratorScreen;