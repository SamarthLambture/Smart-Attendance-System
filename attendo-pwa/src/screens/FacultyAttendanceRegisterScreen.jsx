import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

const FacultyAttendanceRegisterScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject } = location.state || {};

  const [registerData, setRegisterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subject) {
      navigate("/faculty-home");
      return;
    }
    loadRegister();
  }, []);

  const loadRegister = async () => {
    try {
      setLoading(true);
      const facultyData = JSON.parse(localStorage.getItem("faculty_data") || "{}");
      
      if (!facultyData.email) {
        throw new Error("Faculty email not found");
      }

      const data = await apiService.getAttendanceRegister(
        subject.id,
        facultyData.email
      );

      setRegisterData(data);
    } catch (err) {
      console.error("Failed to load register:", err);
      setError(err.message || "Failed to load attendance register");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "5px solid #E5E7EB",
            borderTop: "5px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <div style={{ fontSize: "18px", color: "#374151" }}>Loading register...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        padding: "20px"
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <button
            onClick={() => navigate("/faculty-home")}
            style={{
              background: "white",
              border: "2px solid #E5E7EB",
              color: "#374151",
              padding: "12px 24px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "20px"
            }}
          >
            ← Back
          </button>

          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              background: "#FEE2E2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "48px"
            }}>
              ✖
            </div>
            <h2 style={{ color: "#EF4444", marginBottom: "10px" }}>Error</h2>
            <p style={{ color: "#6B7280" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F3F4F6",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <button
          onClick={() => navigate("/faculty-home")}
          style={{
            background: "white",
            border: "2px solid #E5E7EB",
            color: "#374151",
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px"
          }}
        >
          ← Back to Home
        </button>

        {/* Title Section */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "8px"
              }}>
                📊 Attendance Register
              </h1>
              <p style={{
                fontSize: "18px",
                color: "#667eea",
                fontWeight: "600",
                marginBottom: "5px"
              }}>
                {registerData?.subject_name}
              </p>
              <p style={{
                fontSize: "14px",
                color: "#6B7280"
              }}>
                {registerData?.subject_code}
              </p>
            </div>
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "15px 25px",
              borderRadius: "12px",
              color: "white",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "5px" }}>
                Total Classes
              </div>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>
                {registerData?.dates?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        {registerData && registerData.students && registerData.students.length > 0 ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            overflowX: "auto"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "800px"
            }}>
              <thead>
                <tr style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white"
                }}>
                  <th style={{
                    padding: "15px 10px",
                    textAlign: "left",
                    fontWeight: "600",
                    position: "sticky",
                    left: 0,
                    background: "#667eea",
                    zIndex: 2
                  }}>
                    Roll No.
                  </th>
                  <th style={{
                    padding: "15px 10px",
                    textAlign: "left",
                    fontWeight: "600",
                    minWidth: "200px"
                  }}>
                    Name
                  </th>
                  {registerData.dates.map((date, index) => (
                    <th key={index} style={{
                      padding: "15px 8px",
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: "12px",
                      minWidth: "60px"
                    }}>
                      {new Date(date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </th>
                  ))}
                  <th style={{
                    padding: "15px 10px",
                    textAlign: "center",
                    fontWeight: "600",
                    minWidth: "80px"
                  }}>
                    Present
                  </th>
                  <th style={{
                    padding: "15px 10px",
                    textAlign: "center",
                    fontWeight: "600",
                    minWidth: "80px"
                  }}>
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {registerData.students.map((student, index) => {
                  const isGoodAttendance = student.attendance_percentage >= 85;
                  return (
                    <tr key={student.student_id} style={{
                      background: index % 2 === 0 ? "white" : "#F9FAFB",
                      borderBottom: "1px solid #E5E7EB"
                    }}>
                      <td style={{
                        padding: "12px 10px",
                        fontWeight: "600",
                        color: "#374151",
                        position: "sticky",
                        left: 0,
                        background: index % 2 === 0 ? "white" : "#F9FAFB",
                        zIndex: 1
                      }}>
                        {student.roll_number}
                      </td>
                      <td style={{
                        padding: "12px 10px",
                        color: "#374151"
                      }}>
                        {student.student_name}
                      </td>
                      {registerData.dates.map((date, dateIndex) => {
                        const status = student.dates[date];
                        return (
                          <td key={dateIndex} style={{
                            padding: "12px 8px",
                            textAlign: "center",
                            fontWeight: "600",
                            fontSize: "16px",
                            color: status === "P" ? "#10B981" : "#EF4444"
                          }}>
                            {status}
                          </td>
                        );
                      })}
                      <td style={{
                        padding: "12px 10px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#667eea"
                      }}>
                        {student.total_present}/{student.total_classes}
                      </td>
                      <td style={{
                        padding: "12px 10px",
                        textAlign: "center",
                        fontWeight: "700",
                        fontSize: "16px",
                        color: isGoodAttendance ? "#10B981" : "#EF4444"
                      }}>
                        {student.attendance_percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "60px 20px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "20px"
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "10px"
            }}>
              No Attendance Records
            </h3>
            <p style={{ color: "#6B7280" }}>
              Start taking attendance to see records here
            </p>
          </div>
        )}

        {/* Legend */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          marginTop: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
        }}>
          <div style={{
            display: "flex",
            gap: "30px",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#10B981"
              }}>P</span>
              <span style={{ color: "#6B7280" }}>Present</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#EF4444"
              }}>A</span>
              <span style={{ color: "#6B7280" }}>Absent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                padding: "4px 12px",
                background: "#D1FAE5",
                color: "#059669",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600"
              }}>≥ 85%</span>
              <span style={{ color: "#6B7280" }}>Good Attendance</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                padding: "4px 12px",
                background: "#FEE2E2",
                color: "#DC2626",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600"
              }}>{"< 85%"}</span>
              <span style={{ color: "#6B7280" }}>Low Attendance</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FacultyAttendanceRegisterScreen;