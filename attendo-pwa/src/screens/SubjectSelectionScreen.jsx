import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

const SubjectSelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rollNumber = location.state?.rollNumber || "";

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [groupedSubjects, setGroupedSubjects] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ branch: "", branchCode: "" });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      // Get student data from localStorage
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const email = userData.email;
      const branch = userData.branch;

      if (!email || !branch) {
        setError("Student information not found. Please login again.");
        return;
      }

      // Extract branch code from email (first 2 characters before numbers)
      // e.g., cs24b1027@iiitr.ac.in -> CS
      const branchCode = email.substring(0, 2).toUpperCase();

      setStudentInfo({ branch, branchCode });

      // Fetch ALL subjects for this branch (all years/semesters)
      const subjects = await apiService.getSubjectsByBranch(branchCode);
      
      if (subjects.length === 0) {
        setError(`No subjects found for ${branchCode}. Please contact administrator.`);
      }

      setAvailableSubjects(subjects);

      // Group subjects by semester for better display
      const grouped = subjects.reduce((acc, subject) => {
        const semester = subject.semester;
        if (!acc[semester]) {
          acc[semester] = [];
        }
        acc[semester].push(subject);
        return acc;
      }, {});

      setGroupedSubjects(grouped);
    } catch (err) {
      setError(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      return;
    }

    setSubmitting(true);

    try {
      // Get student email
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const email = userData.email;

      if (!email) {
        throw new Error("Student email not found");
      }

      // Enroll student in selected subjects
      await apiService.enrollStudentSubjects(email, selectedSubjects);

      // Store selected subjects in localStorage for quick access
      const subjects = availableSubjects.filter(s => selectedSubjects.includes(s.id));
      localStorage.setItem("selected_subjects", JSON.stringify(subjects));

      // Navigate to student home
      navigate("/student-home");
    } catch (err) {
      setError(err.message || "Failed to enroll in subjects");
    } finally {
      setSubmitting(false);
    }
  };

  // Get ordered semesters
  const orderedSemesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  return (
    <div className="full-screen" style={{ background: "#F3F4F6" }}>
      <div className="header">
        <button 
          className="back-btn" 
          onClick={() => navigate("/student-home")}
        >
          ← Back
        </button>
        <div>
          <div className="header-title">Select Subjects</div>
          <div className="header-subtitle">
            {studentInfo.branch} - All Years
          </div>
        </div>
        <div style={{ width: "60px" }}></div>
      </div>

      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        {error && (
          <div style={{
            padding: "15px",
            background: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "12px",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "500"
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{
              fontSize: "48px",
              marginBottom: "20px",
              animation: "spin 2s linear infinite"
            }}>
              ⏳
            </div>
            <h4 style={{ fontSize: "18px", color: "#374151" }}>
              Loading subjects...
            </h4>
          </div>
        ) : availableSubjects.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>
              📚
            </div>
            <h4 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px", color: "#374151" }}>
              No Subjects Available
            </h4>
            <p style={{ color: "#6B7280", marginBottom: "20px" }}>
              Please contact your administrator to add subjects for your branch.
            </p>
            <button
              className="btn btn-white"
              onClick={() => navigate("/student-home")}
            >
              Go to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Info Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "2px solid rgba(102, 126, 234, 0.2)"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                marginBottom: "10px" 
              }}>
                <span style={{ fontSize: "24px" }}>ℹ️</span>
                <strong style={{ color: "#4F46E5", fontSize: "16px" }}>
                  Showing all {studentInfo.branchCode} subjects
                </strong>
              </div>
              <p style={{ 
                color: "#6B7280", 
                fontSize: "14px",
                margin: 0,
                lineHeight: "1.6"
              }}>
                Select all subjects you're enrolled in across all years (1st to 4th year).
                You can select subjects from any semester.
              </p>
            </div>

            {/* Subjects grouped by semester */}
            {orderedSemesters.map((semester) => {
              const semesterSubjects = groupedSubjects[semester];
              if (!semesterSubjects || semesterSubjects.length === 0) return null;

              return (
                <div key={semester} style={{ marginBottom: "30px" }}>
                  {/* Semester Header */}
                  <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "12px 20px",
                    borderRadius: "12px 12px 0 0",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span>📚</span>
                    <span>{semester}</span>
                    <span style={{
                      marginLeft: "auto",
                      background: "rgba(255,255,255,0.2)",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "14px"
                    }}>
                      {semesterSubjects.length} subjects
                    </span>
                  </div>

                  {/* Subjects List */}
                  <div className="card" style={{ 
                    borderRadius: "0 0 12px 12px",
                    paddingTop: "10px",
                    marginBottom: "0"
                  }}>
                    {semesterSubjects.map((subject, index) => (
                      <div
                        key={subject.id}
                        className={`checkbox-container ${
                          selectedSubjects.includes(subject.id) ? "selected" : ""
                        }`}
                        onClick={() => toggleSubject(subject.id)}
                        style={{
                          marginBottom: index === semesterSubjects.length - 1 ? "0" : "12px"
                        }}
                      >
                        <div className={`checkbox ${
                          selectedSubjects.includes(subject.id) ? "checked" : ""
                        }`}>
                          {selectedSubjects.includes(subject.id) && (
                            <div className="checkbox-inner"></div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: "600", 
                            color: "#1F2937",
                            fontSize: "15px"
                          }}>
                            {subject.subject_name}
                          </div>
                          <div style={{ 
                            fontSize: "13px", 
                            color: "#6B7280",
                            marginTop: "2px"
                          }}>
                            {subject.subject_code}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Selection Summary */}
            <div style={{
              background: selectedSubjects.length > 0 
                ? "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)"
                : "#EEF2FF",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              textAlign: "center",
              border: selectedSubjects.length > 0
                ? "2px solid #10B981"
                : "2px solid #667eea"
            }}>
              <div style={{ 
                fontSize: "32px", 
                marginBottom: "10px"
              }}>
                {selectedSubjects.length > 0 ? "✅" : "📚"}
              </div>
              <strong style={{ 
                color: selectedSubjects.length > 0 ? "#059669" : "#4F46E5",
                fontSize: "18px",
                display: "block",
                marginBottom: "5px"
              }}>
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
              </strong>
              {selectedSubjects.length > 0 && (
                <p style={{ 
                  color: "#059669", 
                  fontSize: "14px",
                  margin: "5px 0 0 0"
                }}>
                  Click Continue to enroll in selected subjects
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={selectedSubjects.length === 0 || submitting}
              style={{
                width: "100%",
                opacity: selectedSubjects.length === 0 ? 0.5 : 1
              }}
            >
              {submitting ? "Enrolling..." : `Continue with ${selectedSubjects.length} subjects`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubjectSelectionScreen;