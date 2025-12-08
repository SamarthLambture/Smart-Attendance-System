import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AttendanceFormScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const code = location.state?.code || "";

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [photo, setPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const storedSubjects = localStorage.getItem("selected_subjects");
    const storedRoll = localStorage.getItem("roll_number");
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
    if (storedRoll) setRollNumber(storedRoll);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
          alert("Failed to start video preview");
        });
      }
      
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please grant camera permissions.");
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || video.videoWidth === 0) {
      alert("Video not ready. Please wait a moment and try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
      setStream(null);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedSubject || !rollNumber || !photo) {
      alert("Please fill all fields and capture your photo.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        localStorage.setItem("attendance_success", "Attendance marked successfully!");
        navigate("/student-home");
      }, 2500);
    }, 1500);
  };

  if (success) {
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
                <span style={{ fontWeight: "600", color: "#1F2937" }}>{rollNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontWeight: "500" }}>Date:</span>
                <span style={{ fontWeight: "600", color: "#1F2937" }}>{today}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280", fontWeight: "500" }}>Subject:</span>
                <span style={{ fontWeight: "600", color: "#1F2937" }}>
                  {subjects.find(s => s.id === selectedSubject)?.code}
                </span>
              </div>
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

            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Select Subject
              </label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)} 
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  background: "white",
                  outline: "none"
                }}
              >
                <option value="">Choose a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
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
                  <button 
                    type="button" 
                    onClick={capturePhoto} 
                    style={{
                      width: "100%",
                      marginTop: "15px",
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
              disabled={submitting || !photo || !selectedSubject}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                fontWeight: "700",
                color: "white",
                background: submitting || !photo || !selectedSubject
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "12px",
                cursor: submitting || !photo || !selectedSubject ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
              }}
            >
              {submitting ? "Submitting..." : "Mark Attendance"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceFormScreen;