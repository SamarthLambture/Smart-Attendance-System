import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const FacultyHomeScreen = () => {
  const navigate = useNavigate();
  const [facultyName, setFacultyName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacultyData();
  }, [navigate]);

  const loadFacultyData = async () => {
    try {
      const name = localStorage.getItem("faculty_name");
      const id = localStorage.getItem("faculty_id");
      const facultyData = JSON.parse(localStorage.getItem("faculty_data") || "{}");

      if (!name && !id) {
        navigate("/faculty-login");
        return;
      }

      setFacultyName(name || id || "Faculty");
      setFacultyId(id || "");

      // Fetch assigned subjects from backend
      if (facultyData.email) {
        try {
          const assignedSubjects = await apiService.getFacultySubjects(facultyData.email);
          setSubjects(assignedSubjects);
          
          // Also store in localStorage for offline access
          localStorage.setItem("faculty_subjects", JSON.stringify(assignedSubjects));
        } catch (err) {
          console.error("Failed to fetch subjects:", err);
          // Fallback to localStorage if API fails
          const storedSubjects = localStorage.getItem("faculty_subjects");
          if (storedSubjects) {
            setSubjects(JSON.parse(storedSubjects));
          }
        }
      }

      // Set greeting based on time
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    } catch (err) {
      console.error("Error loading faculty data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/user-selection");
    }
  };

  const handleGenerateQR = (subject) => {
    navigate("/faculty-qr-generator", { 
      state: { 
        subject,
        facultyId 
      } 
    });
  };

  if (loading) {
    return (
      <div style={{ 
        background: "#F3F4F6", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
          <div style={{ fontSize: "18px", color: "#374151" }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F3F4F6", minHeight: "100vh" }}>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9,
            animation: "fadeIn 0.3s ease-out"
          }}
        ></div>
      )}

      {/* SIDEBAR */}
      <div style={{
        position: "fixed",
        top: 0,
        left: sidebarOpen ? "0" : "-280px",
        width: "280px",
        height: "100vh",
        background: "white",
        padding: "0",
        boxShadow: "4px 0px 20px rgba(0,0,0,0.15)",
        transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 10,
        overflow: "hidden"
      }}>
        {/* Sidebar Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "30px 20px",
          color: "white"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 15px",
            fontSize: "36px",
            border: "3px solid rgba(255,255,255,0.3)",
            animation: "scaleIn 0.5s ease-out"
          }}>
            👨‍🏫
          </div>
          <div style={{ textAlign: "center", fontWeight: "600", fontSize: "16px" }}>
            {facultyName}
          </div>
          {facultyId && (
            <div style={{ textAlign: "center", fontSize: "12px", opacity: 0.9, marginTop: "5px" }}>
              {facultyId}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div style={{ padding: "20px" }}>
          <div
            className="menu-item"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/faculty-profile");
            }}
            style={{
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginBottom: "8px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span style={{ fontSize: "20px" }}>👤</span>
            <span style={{ fontWeight: "500" }}>Profile</span>
          </div>

          <div
            className="menu-item"
            style={{
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginTop: "20px",
              border: "2px solid #FEE2E2"
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span style={{ fontSize: "20px" }}>🚪</span>
            <span style={{ fontWeight: "500" }}>Logout</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        animation: "slideDown 0.5s ease-out",
        position: "sticky",
        top: 0,
        zIndex: 5
      }}>
        <div
          onClick={() => setSidebarOpen(true)}
          style={{
            cursor: "pointer",
            fontSize: "28px",
            marginRight: "15px",
            padding: "8px",
            borderRadius: "8px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          ☰
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "4px" }}>
            {greeting}! 👋
          </div>
          <div style={{ fontSize: "20px", fontWeight: "700" }}>
            {facultyName}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h3 style={{
          fontSize: "22px",
          fontWeight: "700",
          marginBottom: "20px",
          color: "#1F2937",
          animation: "slideInLeft 0.6s ease-out"
        }}>
          My Subjects
        </h3>

        {subjects.length === 0 ? (
          <div className="card scale-in" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "20px",
              animation: "bounce 2s ease-in-out infinite"
            }}>
              📚
            </div>
            <h4 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px", color: "#374151" }}>
              No Subjects Assigned
            </h4>
            <p style={{ color: "#6B7280", marginBottom: "20px" }}>
              Add subjects to start taking attendance
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/faculty-select-subjects")}
              style={{ maxWidth: "250px", margin: "0 auto" }}
            >
              Add Subjects
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {subjects.map((s, index) => (
              <div
                key={s.id}
                className="card stagger-item"
                style={{
                  padding: "20px",
                  transition: "all 0.3s ease",
                  animation: `slideUp 0.5s ease-out ${index * 0.1}s backwards`,
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 25px 70px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.15)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: "700", fontSize: "18px", color: "#1F2937", marginBottom: "5px" }}>
                      {s.subject_name}
                    </h4>
                    <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "5px" }}>
                      {s.subject_code}
                    </p>
                    <div style={{ 
                      display: "flex", 
                      gap: "8px", 
                      marginTop: "8px",
                      flexWrap: "wrap"
                    }}>
                      <span style={{
                        fontSize: "11px",
                        padding: "4px 10px",
                        background: "rgba(102, 126, 234, 0.1)",
                        color: "#667eea",
                        borderRadius: "12px",
                        fontWeight: "600"
                      }}>
                        {s.branch === "Computer Science & Engineering" ? "CS" :
                         s.branch === "Artifical Intelligence & Data Science" ? "AD" : "MC"}
                      </span>
                      <span style={{
                        fontSize: "11px",
                        padding: "4px 10px",
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#059669",
                        borderRadius: "12px",
                        fontWeight: "600"
                      }}>
                        {s.semester}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>
                    📚
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerateQR(s)}
                  >
                    <span style={{ marginRight: "8px" }}>📱</span>
                    Generate QR
                  </button>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/faculty-attendance-register", { state: { subject: s } })}
                  >
                    <span style={{ marginRight: "8px" }}>📊</span>
                    View Records
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyHomeScreen;