import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const FacultyRegisterScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    facultyId: "",
    name: "",
    email: "",
    department: "",
    designation: ""
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

    if (!formData.facultyId || !formData.name || !formData.email || !formData.department || !formData.designation) {
      setError("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // First send OTP
      await apiService.sendOTP(formData.email, 'faculty', 'registration');

      // Register faculty
      const facultyData = {
        name: formData.name,
        faculty_id: formData.facultyId,
        email: formData.email,
        department: formData.department,
        designation: formData.designation
      };

      await apiService.registerFaculty(facultyData);

      // Store data temporarily for OTP verification
      sessionStorage.setItem("temp_faculty_data", JSON.stringify({
        facultyId: formData.facultyId,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        designation: formData.designation
      }));

      // Navigate to OTP screen
      navigate("/faculty-verify-otp", { 
        state: { 
          name: formData.name,
          facultyId: formData.facultyId,
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
    <div className="full-screen" style={{ background: "#F3F4F6" }}>
      <div className="header">
        <button className="back-btn" onClick={() => navigate("/user-selection")}>
          ← Back
        </button>
        <div>
          <div className="header-title">Faculty Registration</div>
          <div className="header-subtitle">Create your account</div>
        </div>
        <div style={{ width: "60px" }}></div>
      </div>

      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        {error && (
          <div className="error-message" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="input-group">
              <label className="input-label">Faculty ID</label>
              <input
                type="text"
                name="facultyId"
                className="input-field"
                placeholder="Enter faculty ID"
                value={formData.facultyId}
                onChange={handleChange}
                required
              />
            </div>

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
              <label className="input-label">Department</label>
              <select
                name="department"
                className="input-field"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Designation</label>
              <select
                name="designation"
                className="input-field"
                value={formData.designation}
                onChange={handleChange}
                required
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Guest Faculty">Guest Faculty</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue to Verification"}
          </button>

          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <span style={{ color: "#6B7280" }}>Already have an account? </span>
            <span className="link" onClick={() => navigate("/faculty-login")}>
              Login here
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyRegisterScreen;