import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const StudentRegisterScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    branch: "",
    year: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError("");
    setCameraError("");
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser doesn't support camera access. Please use Chrome, Firefox, or Safari.");
        return;
      }

      const constraints = {
        video: { 
          facingMode: "user",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      setShowCamera(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error("Video play error:", err);
            setCameraError("Failed to start video preview");
          });
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      
      let errorMessage = "";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "Camera is being used by another application.";
      } else {
        errorMessage = "Unable to access camera: " + err.message;
      }
      
      setCameraError(errorMessage);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        setPhoto(blob);
        setPhotoPreview(canvas.toDataURL("image/jpeg"));
        stopCamera();
      }, "image/jpeg", 0.8);
    } else {
      setCameraError("Video not ready. Please wait a moment and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const retakePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setCameraError("");
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!photo) {
      setError("Please capture your photo using the camera");
      return;
    }

    const emailRegex = /^[a-z]{2}\d{2}b\d{1,4}@iiitr\.ac\.in$/i;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid institute email (e.g., cs24b1027@iiitr.ac.in)");
      return;
    }

    setLoading(true);

    try {
      // First send OTP
      await apiService.sendOTP(formData.email, 'student', 'registration');

      // Prepare FormData for registration
      const registrationData = new FormData();
      registrationData.append('name', formData.name);
      registrationData.append('roll_number', formData.rollNumber);
      registrationData.append('email', formData.email);
      registrationData.append('branch', formData.branch);
      registrationData.append('year', formData.year);
      registrationData.append('photo', photo, `${formData.rollNumber}.jpg`);

      // Register student
      await apiService.registerStudent(registrationData);

      // Store temporary data for OTP verification
      sessionStorage.setItem("temp_student_data", JSON.stringify({
        name: formData.name,
        rollNumber: formData.rollNumber,
        email: formData.email,
        branch: formData.branch,
        year: formData.year
      }));

      // Navigate to OTP verification
      navigate("/verify-otp", { 
        state: { 
          name: formData.name,
          rollNumber: formData.rollNumber,
          email: formData.email,
          isRegistration: true
        } 
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      width: "100%",
      background: "#F3F4F6",
      boxSizing: "border-box",
      overflowX: "hidden"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <button 
          onClick={() => {
            stopCamera();
            navigate("/user-selection");
          }}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>
            Student Registration
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
            Create your account
          </div>
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        {error && (
          <div style={{
            padding: "15px",
            background: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "12px",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "500"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "border-color 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
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
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                placeholder="Enter roll number"
                value={formData.rollNumber}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  outline: "none"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
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
                Institute Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="cs24b1027@iiitr.ac.in"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  outline: "none"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
              />
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "5px" }}>
                Format: &lt;branch&gt;&lt;year&gt;b&lt;number&gt;@iiitr.ac.in
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                Branch
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  outline: "none",
                  background: "white"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
              >
                <option value="">Select Branch</option>
                <option value="Computer Science & Engineering">CS</option>
                <option value="Artifical Intelligence & Data Science">AIDS</option>
                <option value="Mathematics & Computing">MNC</option>
              </select>
            </div>

            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "12px",
              }}>
                Semester
              </label>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}>
                {[
                  "1st Semester",
                  "2nd Semester",
                  "3rd Semester",
                  "4th Semester",
                  "5th Semester",
                  "6th Semester",
                  "7th Semester",
                  "8th Semester",
                ].map((sem) => (
                  <div
                    key={sem}
                    onClick={() => setFormData({ ...formData, year: sem })}
                    style={{
                      padding: "12px",
                      border: `2px solid ${
                        formData.year === sem ? "#667eea" : "#E5E7EB"
                      }`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      background:
                        formData.year === sem
                          ? "rgba(102, 126, 234, 0.1)"
                          : "white",
                      textAlign: "center",
                      fontWeight: "600",
                      color:
                        formData.year === sem ? "#667eea" : "#6B7280",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {sem}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "15px"
            }}>
              📷 Capture Live Photo (Required)
            </label>

            {cameraError && (
              <div style={{
                padding: "15px",
                background: "#FEF3C7",
                color: "#92400E",
                borderRadius: "12px",
                marginBottom: "15px",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                <strong>⚠️ Camera Issue:</strong>
                <p style={{ margin: "8px 0 0 0" }}>{cameraError}</p>
              </div>
            )}

            {!photoPreview && !showCamera && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "120px",
                  height: "120px",
                  margin: "0 auto 20px",
                  background: "#EEF2FF",
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
                  Open Camera
                </button>
                <p style={{ 
                  marginTop: "15px", 
                  color: "#6B7280", 
                  fontSize: "14px"
                }}>
                  Allow camera access when prompted
                </p>
              </div>
            )}

            {showCamera && (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: "100%", 
                    borderRadius: "12px",
                    background: "#000",
                    minHeight: "300px",
                    maxHeight: "400px",
                    objectFit: "cover"
                  }}
                />
                <div style={{ 
                  marginTop: "15px", 
                  display: "flex", 
                  gap: "10px",
                  flexDirection: "column"
                }}>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    style={{
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
                    onClick={stopCamera}
                    style={{
                      background: "white",
                      color: "#374151",
                      border: "2px solid #E5E7EB",
                      padding: "14px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {photoPreview && (
              <div style={{ textAlign: "center" }}>
                <img
                  src={photoPreview}
                  alt="Captured"
                  style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    margin: "0 auto 20px",
                    display: "block",
                    border: "4px solid #4F46E5"
                  }}
                />
                <div style={{ 
                  padding: "12px",
                  background: "#D1FAE5",
                  color: "#059669",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  fontWeight: "500"
                }}>
                  ✓ Photo captured successfully!
                </div>
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
          </div>

          <button
            type="submit"
            disabled={!photo || loading}
            style={{
              width: "100%",
              background: loading || !photo 
                ? "#9CA3AF" 
                : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
              border: "none",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: loading || !photo ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
              marginBottom: "15px"
            }}
          >
            {loading ? "Processing..." : "Continue to Verification"}
          </button>

          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#6B7280" }}>Already have an account? </span>
            <span 
              onClick={() => {
                stopCamera();
                navigate("/student-login");
              }}
              style={{
                color: "#667eea",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Login here
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegisterScreen;