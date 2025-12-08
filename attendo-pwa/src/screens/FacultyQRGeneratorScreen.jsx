import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FacultyQRGeneratorScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, facultyId } = location.state || {};

  const [attendanceCode, setAttendanceCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isExpired, setIsExpired] = useState(false);

  // Generate random attendance code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    // Generate code and QR on mount
    const code = generateCode();
    setAttendanceCode(code);
    
    // Generate QR code URL using API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${code}`;
    setQrCodeUrl(qrUrl);

    // Start countdown timer
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
  }, [navigate]);

  const handleClose = () => {
    navigate("/faculty-home");
  };

  const getTimerColor = () => {
    if (timeRemaining > 10) return "#10B981";
    if (timeRemaining > 5) return "#F59E0B";
    return "#EF4444";
  };

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
        <div className="card scale-in" style={{ 
          textAlign: "center",
          maxWidth: "450px"
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
          <h1 className="title" style={{ color: "#EF4444", marginBottom: "15px" }}>
            Code Expired!
          </h1>
          <p className="subtitle">
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
          className="back-btn"
          style={{ marginBottom: "20px" }}
        >
          ← Back to Home
        </button>

        <div className="card slide-up" style={{ textAlign: "center" }}>
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
            animation: timeRemaining <= 5 ? "pulse 1s ease-in-out infinite" : "scaleIn 0.6s ease-out",
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

          <h2 className="title" style={{ marginBottom: "10px" }}>
            Scan QR Code
          </h2>
          <p className="subtitle" style={{ marginBottom: "20px" }}>
            {subject?.name} ({subject?.code})
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
            background: timeRemaining <= 5 
              ? "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"
              : "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "14px",
            color: timeRemaining <= 5 ? "#DC2626" : "#92400E",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideUp 0.6s ease-out 0.4s backwards"
          }}>
            <span style={{ fontSize: "20px" }}>
              {timeRemaining <= 5 ? "⚠️" : "💡"}
            </span>
            <div style={{ textAlign: "left" }}>
              {timeRemaining <= 5 ? (
                <strong>Code expiring soon! Students must mark attendance now.</strong>
              ) : (
                <span>This code will expire in <strong>{timeRemaining} seconds</strong></span>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            className="btn btn-white"
            onClick={handleClose}
            style={{ marginTop: "20px", width: "100%" }}
          >
            Close & End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyQRGeneratorScreen;