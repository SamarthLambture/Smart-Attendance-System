import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

const StudentHomeScreen = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [navigate]);

  const loadStudentData = async () => {
    try {
      const name = localStorage.getItem("student_name");
      const roll = localStorage.getItem("roll_number");
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");

      if (!name && !roll) {
        navigate("/student-login");
        return;
      }

      setStudentName(name || roll || "Student");
      setRollNumber(roll || "");

      // Fetch enrolled subjects from backend
      if (userData.email) {
        try {
          const enrolledSubjects = await apiService.getStudentSubjects(userData.email);
          setSubjects(enrolledSubjects);
          
          // Fetch attendance stats for each subject
          const stats = {};
          for (const subject of enrolledSubjects) {
            try {
              const subjectStats = await apiService.getAttendanceStats(
                userData.email,
                subject.id
              );
              stats[subject.id] = subjectStats;
            } catch (err) {
              console.error(`Failed to fetch stats for ${subject.subject_code}:`, err);
              stats[subject.id] = {
                total_classes: 0,
                attended_classes: 0,
                attendance_percentage: 0
              };
            }
          }
          setAttendanceStats(stats);
          
          localStorage.setItem("selected_subjects", JSON.stringify(enrolledSubjects));
        } catch (err) {
          console.error("Failed to fetch subjects:", err);
          const storedSubjects = localStorage.getItem("selected_subjects");
          if (storedSubjects) {
            setSubjects(JSON.parse(storedSubjects));
          }
        }
      }

      // Check for success message
      const msg = localStorage.getItem("attendance_success");
      if (msg) {
        setSuccessMessage(msg);
        localStorage.removeItem("attendance_success");
        setTimeout(() => setSuccessMessage(""), 4000);
      }

      // Set greeting based on time
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    } catch (err) {
      console.error("Error loading student data:", err);
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

  const getSubjectAttendance = (subjectId) => {
    return attendanceStats[subjectId] || {
      total_classes: 0,
      attended_classes: 0,
      attendance_percentage: 0
    };
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
            👤
          </div>
          <div style={{ textAlign: "center", fontWeight: "600", fontSize: "16px" }}>
            {studentName}
          </div>
          {rollNumber && (
            <div style={{ textAlign: "center", fontSize: "12px", opacity: 0.9, marginTop: "5px" }}>
              {rollNumber}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div style={{ padding: "20px" }}>
          <div
            onClick={() => {
              setSidebarOpen(false);
              navigate("/student-profile");
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
            {studentName}
          </div>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div style={{
          background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
          color: "#059669",
          padding: "16px 20px",
          margin: "20px",
          borderRadius: "12px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
          animation: "slideDown 0.5s ease-out"
        }}>
          <span style={{ fontSize: "24px" }}>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

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
          <div style={{ 
            background: "white",
            borderRadius: "20px",
            padding: "60px 20px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            animation: "scaleIn 0.6s ease-out"
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "20px",
              animation: "bounce 2s ease-in-out infinite"
            }}>
              📖
            </div>
            <h4 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px", color: "#374151" }}>
              No Subjects Enrolled
            </h4>
            <p style={{ color: "#6B7280", marginBottom: "20px" }}>
              Add subjects to start marking attendance
            </p>
            <button
              onClick={() => navigate("/select-subjects")}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
              }}
            >
              Add Subjects
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {subjects.map((s, index) => {
              const attendance = getSubjectAttendance(s.id);
              const percentage = attendance.attendance_percentage;
              const isGoodAttendance = percentage >= 85;

              return (
                <div
                  key={s.id}
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    animation: `slideUp 0.5s ease-out ${index * 0.1}s backwards`,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <div>
                      <h4 style={{ fontWeight: "700", fontSize: "18px", color: "#1F2937", marginBottom: "5px" }}>
                        {s.subject_name}
                      </h4>
                      <p style={{ color: "#6B7280", fontSize: "14px" }}>{s.subject_code}</p>
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

                  {/* Attendance Stats */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    marginBottom: "15px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: "20px", fontWeight: "700", color: "#667eea" }}>
                          {attendance.attended_classes}/{attendance.total_classes}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>Classes</div>
                      </div>
                      <div style={{ 
                        width: "1px", 
                        background: "#E5E7EB",
                        margin: "0 10px"
                      }}></div>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ 
                          fontSize: "20px", 
                          fontWeight: "700",
                          color: isGoodAttendance ? "#10B981" : "#EF4444"
                        }}>
                          {percentage.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>Attendance</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{
                      width: "100%",
                      height: "6px",
                      background: "#E5E7EB",
                      borderRadius: "10px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: isGoodAttendance
                          ? "linear-gradient(90deg, #10B981, #059669)" 
                          : "linear-gradient(90deg, #EF4444, #DC2626)",
                        borderRadius: "10px",
                        transition: "width 1s ease-out"
                      }}></div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/qr-scanner", { state: { subject: s, rollNumber } })}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>📷</span>
                    Scan QR Code
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default StudentHomeScreen;