import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FacultyProfileScreen = () => {
  const navigate = useNavigate();
  
  const [facultyName, setFacultyName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [facultyData, setFacultyData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    department: "",
    designation: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("faculty_name");
    const id = localStorage.getItem("faculty_id");
    const data = localStorage.getItem("faculty_data");
    
    if (!name && !id) {
      navigate("/faculty-login");
      return;
    }

    setFacultyName(name || "Faculty");
    setFacultyId(id);
    
    if (data) {
      const parsedData = JSON.parse(data);
      setFacultyData(parsedData);
      setEditData({
        name: parsedData.name || name || "",
        department: parsedData.department || "",
        designation: parsedData.designation || ""
      });
    } else {
      setEditData({
        name: name || "",
        department: "",
        designation: ""
      });
    }
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: facultyData?.name || facultyName || "",
      department: facultyData?.department || "",
      designation: facultyData?.designation || ""
    });
  };

  const handleSave = () => {
    setSaving(true);
    
    setTimeout(() => {
      const updatedData = {
        ...facultyData,
        name: editData.name,
        department: editData.department,
        designation: editData.designation
      };
      
      localStorage.setItem("faculty_data", JSON.stringify(updatedData));
      localStorage.setItem("faculty_name", editData.name);
      setFacultyData(updatedData);
      setFacultyName(editData.name);
      setIsEditing(false);
      setSaving(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/faculty-home")}
          className="back-btn"
          style={{ marginBottom: "20px" }}
        >
          ← Back
        </button>

        <div className="card slide-up">
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 className="title" style={{ marginBottom: "10px" }}>My Profile</h1>
            <p className="subtitle">Manage your account information</p>
          </div>

          {/* Profile Icon */}
          <div style={{
            textAlign: "center",
            marginBottom: "30px",
            animation: "scaleIn 0.6s ease-out"
          }}>
            <div style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
              border: "4px solid #667eea",
              boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "64px"
            }}>
              👨‍🏫
            </div>
          </div>

          {/* Profile Information */}
          <div style={{ animation: "slideUp 0.6s ease-out 0.2s backwards" }}>
            {/* Name */}
            <div className="input-group">
              <label className="input-label">
                <span style={{ marginRight: "8px" }}>👤</span>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              ) : (
                <input
                  type="text"
                  className="input-field"
                  value={facultyName}
                  readOnly
                  style={{
                    background: "#F9FAFB",
                    color: "#374151"
                  }}
                />
              )}
            </div>

            {/* Faculty ID */}
            <div style={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "14px",
                color: "#6B7280",
                marginBottom: "8px",
                fontWeight: "500"
              }}>
                Faculty ID
              </div>
              <div style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#667eea",
                letterSpacing: "2px",
                textTransform: "uppercase"
              }}>
                {facultyId}
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label">
                <span style={{ marginRight: "8px" }}>📧</span>
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={facultyData?.email || ""}
                readOnly
                style={{
                  background: "#F9FAFB",
                  color: "#6B7280",
                  cursor: "not-allowed"
                }}
              />
            </div>

            {/* Department */}
            <div className="input-group">
              <label className="input-label">
                <span style={{ marginRight: "8px" }}>🏛️</span>
                Department
              </label>
              {isEditing ? (
                <select
                  className="input-field"
                  value={editData.department}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  value={facultyData?.department || "Not set"}
                  readOnly
                  style={{
                    background: "#F9FAFB",
                    color: "#374151"
                  }}
                />
              )}
            </div>

            {/* Designation */}
            <div className="input-group">
              <label className="input-label">
                <span style={{ marginRight: "8px" }}>🎓</span>
                Designation
              </label>
              {isEditing ? (
                <select
                  className="input-field"
                  value={editData.designation}
                  onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                >
                  <option value="">Select Designation</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Guest Faculty">Guest Faculty</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  value={facultyData?.designation || "Not set"}
                  readOnly
                  style={{
                    background: "#F9FAFB",
                    color: "#374151"
                  }}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              marginTop: "30px",
              display: "flex",
              gap: "12px",
              animation: "slideUp 0.6s ease-out 0.4s backwards"
            }}>
              {isEditing ? (
                <>
                  <button
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    {saving ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <span className="spinner"></span>
                        Saving...
                      </span>
                    ) : "Save Changes"}
                  </button>
                  <button
                    className="btn btn-white"
                    onClick={handleCancel}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleEdit}
                  style={{ width: "100%" }}
                >
                  <span style={{ marginRight: "8px" }}>✏️</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div style={{
            background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
            padding: "16px",
            borderRadius: "12px",
            marginTop: "25px",
            fontSize: "14px",
            color: "#92400E",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            animation: "slideUp 0.6s ease-out 0.5s backwards"
          }}>
            <span style={{ fontSize: "20px" }}>💡</span>
            <div>
              <strong>Note:</strong> Your faculty ID and email cannot be changed. Contact administration for any updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfileScreen;