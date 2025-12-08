import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const StudentLoginScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
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
    <div className="screen-container">
      <div className="card slide-up">
        <div className="icon-container" style={{ margin: "0 auto 20px" }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
              fill="#4F46E5"
            />
          </svg>
        </div>

        <h1 className="title">Student Login</h1>
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
            <label className="input-label">Institute Email</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="cs24b1027@iiitr.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div style={{ 
              fontSize: "12px", 
              color: "#6B7280", 
              marginTop: "5px" 
            }}>
              Format: &lt;branch&gt;&lt;year&gt;b&lt;number&gt;@iiitr.ac.in
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              className="input-field"
              placeholder="Enter your roll number"
              value={formData.rollNumber}
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
              onClick={() => navigate("/student-register")}
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

export default StudentLoginScreen;