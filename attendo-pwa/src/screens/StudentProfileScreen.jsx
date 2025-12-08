import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const StudentProfileScreen = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    branch: "",
    year: ""
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("student_name");
    const roll = localStorage.getItem("roll_number");
    const user = localStorage.getItem("user_data");
    
    if (!name && !roll) {
      navigate("/student-login");
      return;
    }

    setStudentName(name || "Student");
    setRollNumber(roll);
    
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      setEditData({
        name: parsedUser.name || name || "",
        branch: parsedUser.branch || "",
        year: parsedUser.year || ""
      });
      setProfilePhoto(parsedUser.photo || null);
    } else {
      setEditData({
        name: name || "",
        branch: "",
        year: ""
      });
    }
  }, [navigate]);

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: userData?.name || studentName || "",
      branch: userData?.branch || "",
      year: userData?.year || ""
    });
    setProfilePhoto(userData?.photo || null);
  };

  const handleSave = () => {
    setSaving(true);
    
    setTimeout(() => {
      const updatedUser = {
        ...userData,
        name: editData.name,
        branch: editData.branch,
        year: editData.year,
        photo: profilePhoto
      };
      
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      localStorage.setItem("student_name", editData.name);
      setUserData(updatedUser);
      setStudentName(editData.name);
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
          onClick={() => navigate("/student-home")}
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

          {/* Profile Photo Section */}
          <div style={{
            textAlign: "center",
            marginBottom: "30px",
            animation: "scaleIn 0.6s ease-out"
          }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                onClick={isEditing ? handlePhotoClick : null}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background: profilePhoto 
                    ? `url(${profilePhoto})` 
                    : "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: "4px solid #667eea",
                  boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "64px",
                  cursor: isEditing ? "pointer" : "default",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  if (isEditing) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 15px 50px rgba(102, 126, 234, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isEditing) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 10px 40px rgba(102, 126, 234, 0.4)";
                  }
                }}
              >
                {!profilePhoto && "👤"}
                
                {isEditing && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    📷 Change Photo
                  </div>
                )}
              </div>

              {isEditing && (
                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#667eea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  animation: "pulse 2s ease-in-out infinite"
                }}
                onClick={handlePhotoClick}
                >
                  <span style={{ fontSize: "20px" }}>📷</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
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
                  value={studentName}
                  readOnly
                  style={{
                    background: "#F9FAFB",
                    color: "#374151"
                  }}
                />
              )}
            </div>

            {/* Roll Number */}
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
                Roll Number
              </div>
              <div style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#667eea",
                letterSpacing: "2px",
                textTransform: "uppercase"
              }}>
                {rollNumber}
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
                value={userData?.email || ""}
                readOnly
                style={{
                  background: "#F9FAFB",
                  color: "#6B7280",
                  cursor: "not-allowed"
                }}
              />
            </div>

            {/* Branch */}
            <div className="input-group">
              <label className="input-label">
                <span style={{ marginRight: "8px" }}>🎓</span>
                Branch
              </label>
              {isEditing ? (
                <select
                  className="input-field"
                  value={editData.branch}
                  onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                >
                  <option value="">Select Branch</option>
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
                  value={userData?.branch || "Not set"}
                  readOnly
                  style={{
                    background: "#F9FAFB",
                    color: "#374151"
                  }}
                />
              )}
            </div>

            {/* Year */}
            <div className="input-group">
              <label className="input-label">
                <span style={{ marginRight: "8px" }}>📅</span>
                Year
              </label>
              {isEditing ? (
                <div className="grid grid-2">
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
                    <div
                      key={year}
                      className={`checkbox-container ${editData.year === year ? "selected" : ""}`}
                      onClick={() => setEditData({ ...editData, year })}
                    >
                      <div className={`checkbox ${editData.year === year ? "checked" : ""}`}>
                        {editData.year === year && <div className="checkbox-inner"></div>}
                      </div>
                      <span>{year}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  value={userData?.year || "Not set"}
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
              <strong>Note:</strong> Your roll number and email cannot be changed. Contact administration for any updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileScreen;