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

      if (userData.email) {
        try {
          const enrolledSubjects = await apiService.getStudentSubjects(userData.email);
          setSubjects(enrolledSubjects);
          
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

      const msg = localStorage.getItem("attendance_success");
      if (msg) {
        setSuccessMessage(msg);
        localStorage.removeItem("attendance_success");
        setTimeout(() => setSuccessMessage(""), 4000);
      }

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
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            fontSize: "64px", 
            marginBottom: "20px",
            animation: "spin 2s linear infinite"
          }}>⚡</div>
          <div style={{ 
            fontSize: "18px", 
            color: "#e0e0e0",
            fontWeight: "500",
            letterSpacing: "1px"
          }}>Loading Your Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "fixed",
        top: "-50%",
        right: "-20%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 20s ease-in-out infinite",
        zIndex: 0
      }}></div>
      <div style={{
        position: "fixed",
        bottom: "-30%",
        left: "-15%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 15s ease-in-out infinite reverse",
        zIndex: 0
      }}></div>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 999,
            animation: "fadeIn 0.3s ease-out"
          }}
        ></div>
      )}

      {/* SIDEBAR */}
      <div style={{
        position: "fixed",
        top: 0,
        left: sidebarOpen ? "0" : "-320px",
        width: "320px",
        height: "100vh",
        background: "linear-gradient(180deg, #1e1e3f 0%, #12121f 100%)",
        padding: "0",
        boxShadow: "8px 0px 40px rgba(0,0,0,0.5)",
        transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1000,
        overflow: "hidden",
        borderRight: "1px solid rgba(139, 92, 246, 0.2)"
      }}>
        {/* Sidebar Header */}
        <div style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
          padding: "40px 20px 30px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            filter: "blur(40px)"
          }}></div>
          
          <div style={{
            width: "100px",
            height: "100px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "48px",
            border: "3px solid rgba(255,255,255,0.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "scaleIn 0.6s ease-out, pulse 3s ease-in-out infinite",
            position: "relative"
          }}>
            👤
          </div>
          <div style={{ 
            textAlign: "center", 
            fontWeight: "700", 
            fontSize: "20px",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            position: "relative"
          }}>
            {studentName}
          </div>
          {rollNumber && (
            <div style={{ 
              textAlign: "center", 
              fontSize: "14px", 
              opacity: 0.95, 
              marginTop: "8px",
              background: "rgba(255,255,255,0.15)",
              padding: "6px 16px",
              borderRadius: "20px",
              display: "inline-block",
              position: "relative",
              left: "50%",
              transform: "translateX(-50%)",
              backdropFilter: "blur(10px)"
            }}>
              {rollNumber}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div style={{ padding: "30px 20px" }}>
          <div
            onClick={() => {
              setSidebarOpen(false);
              navigate("/student-profile");
            }}
            style={{
              color: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px 20px",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              marginBottom: "12px",
              border: "1px solid transparent",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)";
              e.currentTarget.style.transform = "translateX(8px)";
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}>
              👤
            </div>
            <span style={{ fontWeight: "600", fontSize: "16px" }}>Profile</span>
          </div>

          <div
            style={{
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px 20px",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              marginTop: "30px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.05)"
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.transform = "translateX(8px)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(239, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}>
              🚪
            </div>
            <span style={{ fontWeight: "600", fontSize: "16px" }}>Logout</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "20px",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(99, 102, 241, 0.95) 50%, rgba(59, 130, 246, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        color: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        animation: "slideDown 0.6s ease-out",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div
          onClick={() => setSidebarOpen(true)}
          style={{
            cursor: "pointer",
            fontSize: "28px",
            marginRight: "15px",
            padding: "10px",
            borderRadius: "12px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          }}
        >
          ☰
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: "14px", 
            opacity: 0.95, 
            marginBottom: "4px",
            fontWeight: "500",
            letterSpacing: "0.5px"
          }}>
            {greeting}! 👋
          </div>
          <div style={{ 
            fontSize: "22px", 
            fontWeight: "700",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            {studentName}
          </div>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)",
          backdropFilter: "blur(20px)",
          color: "#10b981",
          padding: "18px 20px",
          margin: "20px",
          borderRadius: "16px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
          animation: "slideDown 0.6s ease-out, glow 2s ease-in-out infinite",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          position: "relative",
          zIndex: 10
        }}>
          <span style={{ fontSize: "28px" }}>✓</span>
          <span style={{ fontSize: "15px" }}>{successMessage}</span>
        </div>
      )}

      {/* CONTENT */}
      <div style={{ 
        padding: "20px", 
        maxWidth: "900px", 
        margin: "0 auto",
        position: "relative",
        zIndex: 1
      }}>
        <h3 style={{
          fontSize: "26px",
          fontWeight: "700",
          marginBottom: "24px",
          color: "#ffffff",
          animation: "slideInLeft 0.7s ease-out",
          textShadow: "0 2px 20px rgba(139, 92, 246, 0.5)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <span style={{
            fontSize: "32px",
            filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.6))"
          }}>📚</span>
          My Subjects
        </h3>

        {subjects.length === 0 ? (
          <div style={{ 
            background: "linear-gradient(135deg, rgba(30, 30, 63, 0.6) 0%, rgba(18, 18, 31, 0.6) 100%)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "60px 20px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            animation: "scaleIn 0.7s ease-out",
            border: "1px solid rgba(139, 92, 246, 0.2)"
          }}>
            <div style={{
              fontSize: "80px",
              marginBottom: "24px",
              animation: "bounce 2s ease-in-out infinite",
              filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))"
            }}>
              📖
            </div>
            <h4 style={{ 
              fontSize: "24px", 
              fontWeight: "700", 
              marginBottom: "12px", 
              color: "#ffffff",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)"
            }}>
              No Subjects Enrolled
            </h4>
            <p style={{ 
              color: "#a0a0b0", 
              marginBottom: "30px",
              fontSize: "16px"
            }}>
              Add subjects to start marking attendance
            </p>
            <button
              onClick={() => navigate("/select-subjects")}
              style={{
                padding: "16px 40px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "17px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(139, 92, 246, 0.5)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(139, 92, 246, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(139, 92, 246, 0.5)";
              }}
            >
              ✨ Add Subjects
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {subjects.map((s, index) => {
              const attendance = getSubjectAttendance(s.id);
              const percentage = attendance.attendance_percentage;
              const isGoodAttendance = percentage >= 85;

              return (
                <div
                  key={s.id}
                  style={{
                    background: "linear-gradient(135deg, rgba(30, 30, 63, 0.6) 0%, rgba(18, 18, 31, 0.6) 100%)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `slideUp 0.6s ease-out ${index * 0.1}s backwards`,
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 20px 60px rgba(139, 92, 246, 0.4)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.3)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "-50%",
                    right: "-20%",
                    width: "300px",
                    height: "300px",
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(40px)",
                    pointerEvents: "none"
                  }}></div>

                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "20px",
                    position: "relative"
                  }}>
                    <div>
                      <h4 style={{ 
                        fontWeight: "700", 
                        fontSize: "20px", 
                        color: "#ffffff", 
                        marginBottom: "6px",
                        textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                      }}>
                        {s.subject_name}
                      </h4>
                      <p style={{ 
                        color: "#a0a0b0", 
                        fontSize: "14px",
                        fontWeight: "500",
                        letterSpacing: "0.5px"
                      }}>{s.subject_code}</p>
                    </div>
                    <div style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                      boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
                      animation: "pulse 3s ease-in-out infinite"
                    }}>
                      📚
                    </div>
                  </div>

                  {/* Attendance Stats */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
                    padding: "20px",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    border: "1px solid rgba(139, 92, 246, 0.2)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "16px" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ 
                          fontSize: "28px", 
                          fontWeight: "700", 
                          background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textShadow: "0 0 30px rgba(139, 92, 246, 0.5)"
                        }}>
                          {attendance.attended_classes}/{attendance.total_classes}
                        </div>
                        <div style={{ 
                          fontSize: "12px", 
                          color: "#a0a0b0", 
                          marginTop: "4px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px"
                        }}>Classes</div>
                      </div>
                      <div style={{ 
                        width: "2px", 
                        background: "linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.5), transparent)",
                        margin: "0 20px"
                      }}></div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ 
                          fontSize: "28px", 
                          fontWeight: "700",
                          background: isGoodAttendance 
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : "linear-gradient(135deg, #ef4444, #dc2626)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textShadow: isGoodAttendance 
                            ? "0 0 30px rgba(16, 185, 129, 0.5)"
                            : "0 0 30px rgba(239, 68, 68, 0.5)"
                        }}>
                          {percentage.toFixed(1)}%
                        </div>
                        <div style={{ 
                          fontSize: "12px", 
                          color: "#a0a0b0", 
                          marginTop: "4px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "1px"
                        }}>Attendance</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{
                      width: "100%",
                      height: "8px",
                      background: "rgba(30, 30, 63, 0.6)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)"
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: isGoodAttendance
                          ? "linear-gradient(90deg, #10b981, #059669)" 
                          : "linear-gradient(90deg, #ef4444, #dc2626)",
                        borderRadius: "10px",
                        transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: isGoodAttendance
                          ? "0 0 20px rgba(16, 185, 129, 0.6)"
                          : "0 0 20px rgba(239, 68, 68, 0.6)"
                      }}></div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/qr-scanner", { state: { subject: s, rollNumber } })}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "16px",
                      fontSize: "17px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 8px 32px rgba(139, 92, 246, 0.5)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 12px 40px rgba(139, 92, 246, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(139, 92, 246, 0.5)";
                    }}
                  >
                    <span style={{ marginRight: "10px", fontSize: "20px" }}>📷</span>
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
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 8px 40px rgba(16, 185, 129, 0.5); }
        }
        
        @media (max-width: 768px) {
          .subject-card {
            padding: 20px !important;
          }
        }
        
        @media (max-width: 480px) {
          .subject-card h4 {
            font-size: 18px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentHomeScreen;