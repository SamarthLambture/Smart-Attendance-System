import { useNavigate } from "react-router-dom";

const UserSelectionScreen = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      {/* Logo Section */}
      <div style={{
        width: "120px",
        height: "120px",
        background: "rgba(255,255,255,0.2)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "30px",
        border: "3px solid rgba(255,255,255,0.3)",
        animation: "scaleIn 0.6s ease-out"
      }}>
        <span style={{ fontSize: "60px" }}>✓</span>
      </div>

      {/* Title */}
      <div style={{
        textAlign: "center",
        color: "white",
        marginBottom: "50px"
      }}>
        <h1 style={{
          fontSize: "36px",
          fontWeight: "700",
          margin: "0 0 10px 0",
          animation: "slideDown 0.6s ease-out"
        }}>
          Attendo
        </h1>
        <p style={{
          fontSize: "18px",
          opacity: 0.9,
          margin: 0,
          animation: "slideDown 0.6s ease-out 0.2s backwards"
        }}>
          Who are you?
        </p>
      </div>

      {/* Selection Cards */}
      <div style={{
        width: "100%",
        maxWidth: "450px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        {/* Student Card */}
        <div
          onClick={() => navigate("/student-login")}
          style={{
            background: "white",
            padding: "25px 30px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            animation: "slideUp 0.6s ease-out 0.3s backwards"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 15px 50px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.2)";
          }}
        >
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            flexShrink: 0
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1F2937",
              margin: 0
            }}>
              I'm a Student
            </h3>
          </div>
          <div style={{
            fontSize: "24px",
            color: "#9CA3AF"
          }}>
            →
          </div>
        </div>

        {/* Faculty Card */}
        <div
          onClick={() => navigate("/faculty-login")}
          style={{
            background: "white",
            padding: "25px 30px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            animation: "slideUp 0.6s ease-out 0.4s backwards"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 15px 50px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.2)";
          }}
        >
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            flexShrink: 0
          }}>
            👨‍🏫
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1F2937",
              margin: 0
            }}>
              I'm a Faculty
            </h3>
          </div>
          <div style={{
            fontSize: "24px",
            color: "#9CA3AF"
          }}>
            →
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionScreen;