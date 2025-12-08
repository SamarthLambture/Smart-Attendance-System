// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './UserSelectionScreen.css';

// const UserSelectionScreen = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="user-selection-screen">
//       <div className="selection-content fade-in">
//         <div className="selection-header">
//           <div className="icon-container">
//             <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
//               <circle cx="50" cy="50" r="45" fill="#4F46E5" />
//               <path
//                 d="M45 50L48 53L55 46"
//                 stroke="white"
//                 strokeWidth="4"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </div>
//           <h1 className="selection-title">Attendo</h1>
//           <p className="selection-subtitle">Who are you?</p>
//         </div>

//         <div className="selection-buttons">
//           <button
//             className="selection-btn student-btn"
//             onClick={() => navigate('/student-login')}
//           >
//             <div className="btn-icon">
//               <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
//                   fill="currentColor"
//                 />
//               </svg>
//             </div>
//             <span className="btn-text">I'm a Student</span>
//           </button>

//           <button
//             className="selection-btn faculty-btn"
//             onClick={() => navigate('/faculty-login')}
//           >
//             <div className="btn-icon">
//               <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
//                   fill="currentColor"
//                 />
//               </svg>
//             </div>
//             <span className="btn-text">I'm a Faculty</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserSelectionScreen;


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