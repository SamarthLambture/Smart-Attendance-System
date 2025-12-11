import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

const AttendanceFormScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code, subject } = location.state || {};

  const [selectedSubject, setSelectedSubject] = useState(subject?.id || "");
  const [rollNumber, setRollNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const storedRoll = localStorage.getItem("roll_number");
    if (storedRoll) setRollNumber(storedRoll);

    if (!code) {
      alert("No attendance code provided");
      navigate("/student-home");
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  const startCamera = async () => {
  try {
    setVideoReady(false);
    setCameraActive(true);

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });

    setStream(mediaStream);

    if (!videoRef.current) return;

    videoRef.current.srcObject = mediaStream;

    // Fix: use the "loadeddata" event (fires later & reliably on all devices)
    const handleLoadedData = () => {
      videoRef.current.play().then(() => {
        setTimeout(() => {
          setVideoReady(true);
        }, 300);
      }).catch((err) => {
        console.error("Play error:", err);
        setVideoReady(true);
      });
    };

    // Attach event **before** video loads
    videoRef.current.addEventListener("loadeddata", handleLoadedData, { once: true });

    // Safety fallback (in case video loads instantly)
    if (videoRef.current.readyState >= 3) {
      handleLoadedData();
    }

  } catch (err) {
    console.error("Camera error:", err);
    setCameraActive(false);
    setStream(null);

    if (err.name === "NotAllowedError") {
      alert("Camera permission denied. Please enable camera access & refresh.");
    } else if (err.name === "NotFoundError") {
      alert("No camera found on this device.");
    } else if (err.name === "NotReadableError") {
      alert("Camera is in use by another application.");
    } else {
      alert("Unable to access camera: " + err.message);
    }
  }
};


  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video) {
      alert("Video element not found. Please restart the camera.");
      return;
    }

    // Force set dimensions even if video isn't fully ready
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (width === 0 || height === 0) {
      alert("Camera feed not available. Please allow camera access and try again.");
      return;
    }

    try {
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, width, height);

      const imageData = canvas.toDataURL("image/png");
      setPhoto(imageData);

      // Convert to blob for API upload
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "photo.png", { type: "image/png" });
          setPhotoBlob(blob);
        } else {
          alert("Failed to create image. Please try again.");
        }
      }, 'image/png');

      // Stop camera after capture
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setCameraActive(false);
        setStream(null);
        setVideoReady(false);
      }
    } catch (err) {
      console.error("Capture error:", err);
      alert("Failed to capture photo. Please try again.");
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setPhotoBlob(null);
    setVideoReady(false);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSubject || !rollNumber || !photoBlob) {
      alert("Please fill all fields and capture your photo.");
      return;
    }

    setSubmitting(true);

    try {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      
      if (!userData.email) {
        throw new Error("User email not found. Please login again.");
      }

      // Mark attendance via API
      const response = await apiService.markAttendance(
        code,
        selectedSubject,
        userData.email,
        photoBlob
      );

      // Get updated attendance stats
      const stats = await apiService.getAttendanceStats(
        userData.email,
        selectedSubject
      );

      setAttendanceData({
        ...stats,
        rollNumber,
        subjectCode: subject?.subject_code || "",
        date: today
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/student-home");
      }, 3000);

    } catch (error) {
      setSubmitting(false);
      alert(error.message || "Failed to mark attendance. Please try again.");
    }
  };

  if (success && attendanceData) {
    const percentage = attendanceData.attendance_percentage;
    const isGoodAttendance = percentage >= 85;

    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        boxSizing: "border-box"
      }}>
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "40px 30px",
          textAlign: "center",
          maxWidth: "450px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "scaleIn 0.6s ease-out"
        }}>
          <div style={{
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 25px",
            fontSize: "56px",
            animation: "scaleIn 0.6s ease-out, pulse 1.5s ease-in-out infinite 0.6s",
            boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)"
          }}>
            ✓
          </div>
          <h1 style={{ 
            color: "#059669",
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "15px"
          }}>
            Attendance Marked!
          </h1>
          <p style={{ 
            fontSize: "16px", 
            color: "#6B7280",
            marginBottom: "30px" 
          }}>
            Your attendance has been recorded successfully
          </p>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px"
          }}>
            <div style={{ display: "grid", gap: "10px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontWeight: "500" }}>Roll Number:</span>
                <span style={{ fontWeight: "600", color: "#1F2937" }}>{attendanceData.rollNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontWeight: "500" }}>Date:</span>
                <span style={{ fontWeight: "600", color: "#1F2937" }}>{attendanceData.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontWeight: "500" }}>Subject:</span>
                <span style={{ fontWeight: "600", color: "#1F2937" }}>
                  {attendanceData.subjectCode}
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div style={{
            background: isGoodAttendance 
              ? "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)"
              : "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px"
          }}>
            <div style={{ 
              fontSize: "48px", 
              fontWeight: "700",
              color: isGoodAttendance ? "#059669" : "#DC2626",
              marginBottom: "10px"
            }}>
              {percentage}%
            </div>
            <div style={{ 
              fontSize: "14px", 
              color: isGoodAttendance ? "#059669" : "#DC2626",
              fontWeight: "600",
              marginBottom: "10px"
            }}>
              Current Attendance
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#6B7280"
            }}>
              {attendanceData.attended_classes} / {attendanceData.total_classes} classes attended
            </div>
          </div>

          <button
            onClick={() => navigate("/student-home")}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)"
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      boxSizing: "border-box",
      overflowX: "hidden"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <button
          onClick={() => {
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            navigate("/student-home");
          }}
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
          ← Back
        </button>

        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "slideUp 0.5s ease-out"
        }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              animation: "scaleIn 0.6s ease-out",
              boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)"
            }}>
              ✅
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "10px"
            }}>
              Mark Attendance
            </h1>
            <p style={{
              fontSize: "16px",
              color: "#6B7280"
            }}>
              Confirm your attendance details
            </p>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "25px",
            textAlign: "center",
            boxShadow: "inset 0 2px 10px rgba(102, 126, 234, 0.1)"
          }}>
            <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px", fontWeight: "500" }}>
              Attendance Code
            </div>
            <div style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#4F46E5",
              letterSpacing: "6px",
              fontFamily: "monospace"
            }}>
              {code}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  background: "#F9FAFB",
                  color: "#6B7280",
                  textTransform: "uppercase"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Date
              </label>
              <input 
                type="date" 
                value={today} 
                readOnly 
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  background: "#F9FAFB",
                  color: "#6B7280"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Subject
              </label>
              <input 
                type="text"
                value={subject?.subject_name || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  background: "#F9FAFB",
                  color: "#6B7280"
                }}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "15px"
              }}>
                📷 Capture Live Photo
              </label>

              {!photo && !cameraActive && (
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "120px",
                    height: "120px",
                    margin: "0 auto 20px",
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px"
                  }}>
                    📸
                  </div>
                  <button 
                    type="button" 
                    onClick={startCamera}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      padding: "14px 28px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                    }}
                  >
                    Start Camera
                  </button>
                </div>
              )}

              {cameraActive && !photo && (
                <div>
                  <div style={{ position: "relative" }}>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      style={{ 
                        width: "100%", 
                        borderRadius: "16px",
                        border: "3px solid #667eea",
                        boxShadow: "0 10px 40px rgba(102, 126, 234, 0.3)",
                        minHeight: "300px",
                        maxHeight: "400px",
                        objectFit: "cover",
                        background: "#000"
                      }}
                    />
                    {!videoReady && (
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        background: "rgba(0,0,0,0.7)",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        textAlign: "center"
                      }}>
                        <div>Loading camera...</div>
                        <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8 }}>
                          If stuck, try clicking capture anyway
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button 
                      type="button" 
                      onClick={capturePhoto}
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        color: "white",
                        border: "none",
                        padding: "14px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      📸 Capture Photo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (stream) {
                          stream.getTracks().forEach(track => track.stop());
                        }
                        setCameraActive(false);
                        setStream(null);
                        setVideoReady(false);
                      }}
                      style={{
                        padding: "14px 20px",
                        background: "#EF4444",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {photo && (
                <div style={{ textAlign: "center" }}>
                  <img 
                    src={photo} 
                    alt="Captured" 
                    style={{ 
                      width: "200px", 
                      height: "200px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto 20px",
                      display: "block",
                      border: "4px solid #10B981",
                      boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)"
                    }} 
                  />
                  <div style={{
                    background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
                    color: "#059669",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "15px",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>✓</span> Photo captured successfully!
                  </div>
                  <br />
                  <button
                    type="button"
                    onClick={retakePhoto}
                    style={{
                      background: "white",
                      color: "#374151",
                      border: "2px solid #E5E7EB",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    🔄 Retake Photo
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "25px",
              fontSize: "14px",
              color: "#92400E",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "20px" }}>💡</span>
              <span>Make sure you're in the correct class before marking attendance</span>
            </div>

            <button
              type="submit"
              disabled={submitting || !photoBlob || !selectedSubject}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                fontWeight: "700",
                color: "white",
                background: submitting || !photoBlob || !selectedSubject
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "12px",
                cursor: submitting || !photoBlob || !selectedSubject ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
              }}
            >
              {submitting ? "Submitting..." : "Mark Attendance"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default AttendanceFormScreen;