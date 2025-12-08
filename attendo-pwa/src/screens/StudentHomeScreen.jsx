import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudentHomeScreen = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("student_name");
    const roll = localStorage.getItem("roll_number");
    const storedSubjects = localStorage.getItem("selected_subjects");

    if (!name && !roll) {
      navigate("/student-login");
      return;
    }

    setStudentName(name || roll || "Student");
    setRollNumber(roll || "");
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));

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
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/user-selection");
    }
  };

  const getSubjectAttendance = (subjectId) => {
    const attendanceData = {
      1: { total: 10, present: 9, percentage: 90 },
      2: { total: 12, present: 10, percentage: 83 },
      3: { total: 15, present: 12, percentage: 80 },
      4: { total: 8, present: 7, percentage: 88 },
      5: { total: 11, present: 8, percentage: 73 },
      6: { total: 9, present: 8, percentage: 89 },
    };
    return attendanceData[subjectId] || { total: 10, present: 8, percentage: 80 };
  };

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
            className="menu-item"
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
            {studentName}
          </div>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="slide-down" style={{
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
          <div className="card scale-in" style={{ textAlign: "center", padding: "60px 20px" }}>
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
              className="btn btn-primary"
              onClick={() => navigate("/select-subjects")}
              style={{ maxWidth: "250px", margin: "0 auto" }}
            >
              Add Subjects
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {subjects.map((s, index) => {
              const attendance = getSubjectAttendance(s.id);
              return (
                <div
                  key={s.id}
                  className="card stagger-item"
                  style={{
                    padding: "20px",
                    cursor: "pointer",
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <div>
                      <h4 style={{ fontWeight: "700", fontSize: "18px", color: "#1F2937", marginBottom: "5px" }}>
                        {s.name}
                      </h4>
                      <p style={{ color: "#6B7280", fontSize: "14px" }}>{s.code}</p>
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

                  {/* Attendance Stats for this subject */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    padding: "15px",
                    borderRadius: "12px",
                    marginBottom: "15px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: "20px", fontWeight: "700", color: "#667eea" }}>
                          {attendance.present}/{attendance.total}
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
                          color: attendance.percentage >= 75 ? "#10B981" : attendance.percentage >= 60 ? "#F59E0B" : "#EF4444"
                        }}>
                          {attendance.percentage}%
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
                        width: `${attendance.percentage}%`,
                        height: "100%",
                        background: attendance.percentage >= 75 
                          ? "linear-gradient(90deg, #10B981, #059669)" 
                          : attendance.percentage >= 60 
                          ? "linear-gradient(90deg, #F59E0B, #D97706)"
                          : "linear-gradient(90deg, #EF4444, #DC2626)",
                        borderRadius: "10px",
                        transition: "width 1s ease-out"
                      }}></div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "10px" }}
                    onClick={() => navigate("/qr-scanner", { state: { subject: s, rollNumber } })}
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

    </div>
  );
};

export default StudentHomeScreen;