import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FacultySubjectSelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const facultyId = location.state?.facultyId || "";

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [error, setError] = useState("");

  const availableSubjects = [
    { id: 1, code: "CS101", name: "Data Structures" },
    { id: 2, code: "CS102", name: "Algorithms" },
    { id: 3, code: "CS103", name: "Database Management" },
    { id: 4, code: "CS104", name: "Operating Systems" },
    { id: 5, code: "CS105", name: "Computer Networks" },
    { id: 6, code: "CS106", name: "Software Engineering" },
  ];

  const toggleSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      return;
    }

    // Store selected subjects in localStorage
    const subjects = availableSubjects.filter(s => selectedSubjects.includes(s.id));
    localStorage.setItem("faculty_id", facultyId);
    localStorage.setItem("faculty_subjects", JSON.stringify(subjects));

    // Navigate to faculty home
    navigate("/faculty-home");
  };

  return (
    <div className="full-screen" style={{ background: "#F3F4F6" }}>
      <div className="header">
        <div style={{ width: "60px" }}></div>
        <div>
          <div className="header-title">Select Subjects</div>
          <div className="header-subtitle">Choose subjects you teach</div>
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
            <p style={{ 
              marginBottom: "20px", 
              color: "#6B7280",
              textAlign: "center" 
            }}>
              Select all subjects you are teaching this semester
            </p>

            {availableSubjects.map((subject) => (
              <div
                key={subject.id}
                className={`checkbox-container ${
                  selectedSubjects.includes(subject.id) ? "selected" : ""
                }`}
                onClick={() => toggleSubject(subject.id)}
              >
                <div className={`checkbox ${
                  selectedSubjects.includes(subject.id) ? "checked" : ""
                }`}>
                  {selectedSubjects.includes(subject.id) && (
                    <div className="checkbox-inner"></div>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#1F2937" }}>
                    {subject.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6B7280" }}>
                    {subject.code}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: "#EEF2FF",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            <strong style={{ color: "#4F46E5" }}>
              {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
            </strong>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={selectedSubjects.length === 0}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultySubjectSelectionScreen;