import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const FacultyLoginScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    facultyId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.facultyId) {
      setError("Please fill in all fields");
      return;
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      // Send OTP via API
      await apiService.sendOTP(formData.email, 'faculty', 'login');
      
      // Store user data temporarily in sessionStorage
      sessionStorage.setItem("temp_faculty_data", JSON.stringify({
        name: formData.name,
        email: formData.email,
        facultyId: formData.facultyId
      }));
      
      // Navigate to OTP verification
      navigate("/faculty-verify-otp", {
        state: {
          name: formData.name,
          email: formData.email,
          facultyId: formData.facultyId,
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
    <div className="screen-container">
      <div className="card slide-up">
        <div className="icon-container" style={{ margin: "0 auto 20px" }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
              fill="white"
            />
          </svg>
        </div>

        <h1 className="title">Faculty Login</h1>
        <p className="subtitle">Enter your details to continue</p>

        {error && (
          <div className="error-message" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="your.email@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Faculty ID</label>
            <input
              type="text"
              name="facultyId"
              className="input-field"
              placeholder="Enter your faculty ID"
              value={formData.facultyId}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <span style={{ color: "#6B7280" }}>Don't have an account? </span>
            <span 
              className="link"
              onClick={() => navigate("/faculty-register")}
            >
              Register here
            </span>
          </div>
        </form>

        <button 
          className="btn btn-white"
          onClick={() => navigate("/user-selection")}
          style={{ marginTop: "15px" }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default FacultyLoginScreen;