import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

const FacultySubjectSelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const facultyId = location.state?.facultyId || "";

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [groupedSubjects, setGroupedSubjects] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllSubjects();
  }, []);

  const loadAllSubjects = async () => {
    try {
      // Fetch ALL subjects from database (all branches, all semesters)
      const subjects = await apiService.getAllSubjects();
      
      if (subjects.length === 0) {
        setError("No subjects found in database. Please contact administrator.");
      }

      setAvailableSubjects(subjects);

      // Group subjects by branch first, then by semester
      const grouped = subjects.reduce((acc, subject) => {
        const branch = subject.branch;
        if (!acc[branch]) {
          acc[branch] = {};
        }
        
        const semester = subject.semester;
        if (!acc[branch][semester]) {
          acc[branch][semester] = [];
        }
        
        acc[branch][semester].push(subject);
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
      // Get faculty email
      const facultyData = JSON.parse(localStorage.getItem('faculty_data') || '{}');
      const email = facultyData.email;

      if (!email) {
        throw new Error("Faculty email not found");
      }

      // Assign subjects to faculty
      await apiService.assignFacultySubjects(email, selectedSubjects);

      // Store selected subjects in localStorage for quick access
      const subjects = availableSubjects.filter(s => selectedSubjects.includes(s.id));
      localStorage.setItem("faculty_subjects", JSON.stringify(subjects));

      // Navigate to faculty home
      navigate("/faculty-home");
    } catch (err) {
      setError(err.message || "Failed to assign subjects");
    } finally {
      setSubmitting(false);
    }
  };

  // Get ordered semesters
  const orderedSemesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  // Branch display names
  const branchNames = {
    "Computer Science & Engineering": "CS",
    "Artifical Intelligence & Data Science": "AD",
    "Mathematics & Computing": "MC"
  };

  return (
    <div className="full-screen" style={{ background: "#F3F4F6" }}>
      <div className="header">
        <button 
          className="back-btn" 
          onClick={() => navigate("/faculty-home")}
        >
          ← Back
        </button>
        <div>
          <div className="header-title">Select Subjects</div>
          <div className="header-subtitle">All Branches & Years</div>
        </div>
        <div style={{ width: "60px" }}></div>
      </div>

      <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
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
              Please contact administrator to add subjects.
            </p>
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
                <span style={{ fontSize: "24px" }}>👨‍🏫</span>
                <strong style={{ color: "#4F46E5", fontSize: "16px" }}>
                  Select subjects you teach
                </strong>
              </div>
              <p style={{ 
                color: "#6B7280", 
                fontSize: "14px",
                margin: 0,
                lineHeight: "1.6"
              }}>
                You can select subjects from any branch and any semester. 
                Choose all the subjects you're teaching this academic year.
              </p>
              <div style={{
                marginTop: "12px",
                padding: "10px",
                background: "white",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#374151"
              }}>
                <strong>Total available:</strong> {availableSubjects.length} subjects 
                (CS: {availableSubjects.filter(s => s.branch === "Computer Science & Engineering").length}, 
                AD: {availableSubjects.filter(s => s.branch === "Artifical Intelligence & Data Science").length}, 
                MC: {availableSubjects.filter(s => s.branch === "Mathematics & Computing").length})
              </div>
            </div>

            {/* Subjects grouped by branch and semester */}
            {Object.keys(groupedSubjects).sort().map((branch) => {
              const branchSubjects = groupedSubjects[branch];
              const branchCode = branchNames[branch] || branch;
              
              return (
                <div key={branch} style={{ marginBottom: "30px" }}>
                  {/* Branch Header */}
                  <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "15px",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
                  }}>
                    <span style={{ fontSize: "24px" }}>🎓</span>
                    <span>{branch}</span>
                    <span style={{
                      marginLeft: "auto",
                      background: "rgba(255,255,255,0.25)",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "14px"
                    }}>
                      {branchCode}
                    </span>
                  </div>

                  {/* Semesters for this branch */}
                  {orderedSemesters.map((semester) => {
                    const semesterSubjects = branchSubjects[semester];
                    if (!semesterSubjects || semesterSubjects.length === 0) return null;

                    return (
                      <div key={`${branch}-${semester}`} style={{ marginBottom: "20px" }}>
                        {/* Semester Header */}
                        <div style={{
                          background: "rgba(102, 126, 234, 0.08)",
                          padding: "10px 20px",
                          borderRadius: "8px 8px 0 0",
                          fontWeight: "600",
                          fontSize: "15px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: "#4F46E5"
                        }}>
                          <span>📚</span>
                          <span>{semester}</span>
                          <span style={{
                            marginLeft: "auto",
                            background: "rgba(102, 126, 234, 0.15)",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "13px"
                          }}>
                            {semesterSubjects.length} subjects
                          </span>
                        </div>

                        {/* Subjects List */}
                        <div className="card" style={{ 
                          borderRadius: "0 0 8px 8px",
                          paddingTop: "10px",
                          marginBottom: "0",
                          marginTop: "0"
                        }}>
                          {semesterSubjects.map((subject, index) => (
                            <div
                              key={subject.id}
                              className={`checkbox-container ${
                                selectedSubjects.includes(subject.id) ? "selected" : ""
                              }`}
                              onClick={() => toggleSubject(subject.id)}
                              style={{
                                marginBottom: index === semesterSubjects.length - 1 ? "0" : "10px"
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
                </div>
              );
            })}

            {/* Selection Summary - Sticky at bottom */}
            <div style={{
              position: "sticky",
              bottom: "20px",
              background: selectedSubjects.length > 0 
                ? "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)"
                : "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              textAlign: "center",
              border: selectedSubjects.length > 0
                ? "2px solid #10B981"
                : "2px solid #667eea",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
            }}>
              <div style={{ 
                fontSize: "32px", 
                marginBottom: "10px"
              }}>
                {selectedSubjects.length > 0 ? "✅" : "📚"}
              </div>
              <strong style={{ 
                color: selectedSubjects.length > 0 ? "#059669" : "#4F46E5",
                fontSize: "20px",
                display: "block",
                marginBottom: "8px"
              }}>
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
              </strong>
              {selectedSubjects.length > 0 && (
                <p style={{ 
                  color: "#059669", 
                  fontSize: "14px",
                  margin: "5px 0 15px 0"
                }}>
                  Ready to assign these subjects
                </p>
              )}
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={selectedSubjects.length === 0 || submitting}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  opacity: selectedSubjects.length === 0 ? 0.5 : 1,
                  fontSize: "16px",
                  padding: "14px"
                }}
              >
                {submitting ? "Assigning..." : `Continue with ${selectedSubjects.length} subjects`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FacultySubjectSelectionScreen;