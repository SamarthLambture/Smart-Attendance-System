// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import apiService from "../services/api";

// const FacultyQRGeneratorScreen = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { subject } = location.state || {};

//   const [attendanceCode, setAttendanceCode] = useState("");
//   const [qrCodeUrl, setQrCodeUrl] = useState("");
//   const [timeRemaining, setTimeRemaining] = useState(240); // 1 minute = 60 seconds
//   const [isExpired, setIsExpired] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [sessionId, setSessionId] = useState(null);

//   useEffect(() => {
//     let isSubscribed = true; // Prevent double calls
    
//     if (!subject) {
//       navigate("/faculty-home");
//       return;
//     }
    
//     // Only create session if flag is true
//     if (isSubscribed) {
//       createSession();
//     }
    
//     return () => {
//       isSubscribed = false; // Cleanup
//     };
//   }, []);

//   const createSession = async () => {
//     try {
//       setLoading(true);
//       setError("");
      
//       const facultyData = JSON.parse(localStorage.getItem("faculty_data") || "{}");
      
//       if (!facultyData.email) {
//         throw new Error("Faculty email not found");
//       }

//       // Create attendance session via API
//       const response = await apiService.createAttendanceSession(
//         facultyData.email,
//         subject.id
//       );

//       setSessionId(response.session_id);
//       setAttendanceCode(response.session_code);
      
//       // Generate QR code URL using API
//       const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${response.session_code}`;
//       setQrCodeUrl(qrUrl);
      
//       setLoading(false);

//       // Start countdown timer (60 seconds)
//       const timer = setInterval(() => {
//         setTimeRemaining((prev) => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             setIsExpired(true);
//             // Auto redirect after expiry
//             setTimeout(() => {
//               navigate("/faculty-home");
//             }, 2000);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);

//       return () => clearInterval(timer);
//     } catch (err) {
//       console.error("Create session error:", err);
//       setError(err.message || "Failed to create attendance session");
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     navigate("/faculty-home");
//   };

//   const getTimerColor = () => {
//     if (timeRemaining > 40) return "#10B981";
//     if (timeRemaining > 20) return "#F59E0B";
//     return "#EF4444";
//   };

//   if (loading) {
//     return (
//       <div style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//         padding: "20px"
//       }}>
//         <div style={{ 
//           background: "white",
//           borderRadius: "20px",
//           padding: "40px",
//           textAlign: "center",
//           maxWidth: "400px"
//         }}>
//           <div style={{
//             width: "60px",
//             height: "60px",
//             border: "5px solid #E5E7EB",
//             borderTop: "5px solid #667eea",
//             borderRadius: "50%",
//             animation: "spin 1s linear infinite",
//             margin: "0 auto 20px"
//           }}></div>
//           <p style={{ fontSize: "18px", color: "#374151" }}>
//             Generating QR Code...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//         padding: "20px"
//       }}>
//         <div style={{ 
//           background: "white",
//           borderRadius: "20px",
//           padding: "40px",
//           textAlign: "center",
//           maxWidth: "450px"
//         }}>
//           <div style={{
//             width: "100px",
//             height: "100px",
//             background: "#FEE2E2",
//             borderRadius: "50%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             margin: "0 auto 25px",
//             fontSize: "48px"
//           }}>
//             ❌
//           </div>
//           <h2 style={{ fontSize: "24px", color: "#EF4444", marginBottom: "15px" }}>
//             Error
//           </h2>
//           <p style={{ color: "#6B7280", marginBottom: "25px" }}>
//             {error}
//           </p>
//           <button
//             onClick={() => navigate("/faculty-home")}
//             style={{
//               width: "100%",
//               padding: "16px",
//               background: "#667eea",
//               color: "white",
//               border: "none",
//               borderRadius: "12px",
//               fontSize: "16px",
//               fontWeight: "600",
//               cursor: "pointer"
//             }}
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (isExpired) {
//     return (
//       <div style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//         padding: "20px"
//       }}>
//         <div style={{ 
//           background: "white",
//           borderRadius: "20px",
//           padding: "40px",
//           textAlign: "center",
//           maxWidth: "450px",
//           animation: "scaleIn 0.6s ease-out"
//         }}>
//           <div style={{
//             width: "100px",
//             height: "100px",
//             background: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
//             borderRadius: "50%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             margin: "0 auto 25px",
//             fontSize: "48px",
//             animation: "scaleIn 0.6s ease-out"
//           }}>
//             ⏱️
//           </div>
//           <h1 style={{ 
//             fontSize: "28px",
//             fontWeight: "700",
//             color: "#EF4444",
//             marginBottom: "15px"
//           }}>
//             Code Expired!
//           </h1>
//           <p style={{ fontSize: "16px", color: "#6B7280" }}>
//             The attendance code has expired. Redirecting...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       minHeight: "100vh",
//       background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//       padding: "20px"
//     }}>
//       <div style={{ maxWidth: "600px", margin: "0 auto" }}>
//         <button
//           onClick={handleClose}
//           style={{
//             background: "rgba(255,255,255,0.2)",
//             border: "none",
//             color: "white",
//             padding: "12px 24px",
//             borderRadius: "10px",
//             fontSize: "16px",
//             fontWeight: "600",
//             cursor: "pointer",
//             marginBottom: "20px"
//           }}
//         >
//           ← Back to Home
//         </button>

//         <div style={{
//           background: "white",
//           borderRadius: "20px",
//           padding: "30px",
//           boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
//           animation: "slideUp 0.5s ease-out",
//           textAlign: "center"
//         }}>
//           {/* Timer Circle */}
//           <div style={{
//             width: "120px",
//             height: "120px",
//             margin: "0 auto 30px",
//             borderRadius: "50%",
//             background: `linear-gradient(135deg, ${getTimerColor()} 0%, ${getTimerColor()}dd 100%)`,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             flexDirection: "column",
//             boxShadow: `0 10px 40px ${getTimerColor()}40`,
//             animation: timeRemaining <= 10 ? "pulse 1s ease-in-out infinite" : "scaleIn 0.6s ease-out",
//             border: "4px solid white",
//             position: "relative"
//           }}>
//             <div style={{
//               fontSize: "42px",
//               fontWeight: "700",
//               color: "white",
//               lineHeight: "1"
//             }}>
//               {timeRemaining}
//             </div>
//             <div style={{
//               fontSize: "12px",
//               color: "white",
//               opacity: 0.9,
//               marginTop: "4px",
//               fontWeight: "600"
//             }}>
//               seconds
//             </div>
//           </div>

//           <h2 style={{
//             fontSize: "28px",
//             fontWeight: "700",
//             color: "#1F2937",
//             marginBottom: "10px"
//           }}>
//             Scan QR Code
//           </h2>
//           <p style={{
//             fontSize: "16px",
//             color: "#6B7280",
//             marginBottom: "20px"
//           }}>
//             {subject?.subject_name} ({subject?.subject_code})
//           </p>

//           {/* QR Code Display */}
//           <div style={{
//             background: "white",
//             padding: "20px",
//             borderRadius: "16px",
//             marginBottom: "25px",
//             display: "inline-block",
//             boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
//             animation: "scaleIn 0.7s ease-out 0.2s backwards"
//           }}>
//             <img
//               src={qrCodeUrl}
//               alt="QR Code"
//               style={{
//                 width: "280px",
//                 height: "280px",
//                 display: "block"
//               }}
//             />
//           </div>

//           {/* Attendance Code Display */}
//           <div style={{
//             background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
//             padding: "20px",
//             borderRadius: "16px",
//             marginBottom: "25px",
//             animation: "slideUp 0.6s ease-out 0.3s backwards",
//             boxShadow: "inset 0 2px 10px rgba(102, 126, 234, 0.1)"
//           }}>
//             <div style={{
//               fontSize: "14px",
//               color: "#6B7280",
//               marginBottom: "10px",
//               fontWeight: "500"
//             }}>
//               Attendance Code
//             </div>
//             <div style={{
//               fontSize: "36px",
//               fontWeight: "700",
//               color: "#4F46E5",
//               letterSpacing: "8px",
//               fontFamily: "monospace"
//             }}>
//               {attendanceCode}
//             </div>
//             <div style={{
//               fontSize: "12px",
//               color: "#6B7280",
//               marginTop: "10px"
//             }}>
//               Students can also enter this code manually
//             </div>
//           </div>

//           {/* Warning Box */}
//           <div style={{
//             background: timeRemaining <= 10
//               ? "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)"
//               : "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
//             padding: "16px",
//             borderRadius: "12px",
//             fontSize: "14px",
//             color: timeRemaining <= 10 ? "#DC2626" : "#92400E",
//             display: "flex",
//             alignItems: "center",
//             gap: "12px",
//             animation: "slideUp 0.6s ease-out 0.4s backwards"
//           }}>
//             <span style={{ fontSize: "20px" }}>
//               {timeRemaining <= 10 ? "⚠️" : "💡"}
//             </span>
//             <div style={{ textAlign: "left" }}>
//               {timeRemaining <= 10 ? (
//                 <strong>Code expiring soon! Students must mark attendance now.</strong>
//               ) : (
//                 <span>This code will expire in <strong>{timeRemaining} seconds</strong></span>
//               )}
//             </div>
//           </div>

//           {/* View Records Button */}
//           {sessionId && (
//             <button
//               onClick={() => navigate("/faculty-session-records", { 
//                 state: { sessionId, subject } 
//               })}
//               style={{
//                 width: "100%",
//                 padding: "14px",
//                 background: "white",
//                 color: "#667eea",
//                 border: "2px solid #667eea",
//                 borderRadius: "12px",
//                 fontSize: "16px",
//                 fontWeight: "600",
//                 cursor: "pointer",
//                 marginTop: "15px"
//               }}
//             >
//               📊 View Attendance Records
//             </button>
//           )}

//           {/* Close Button */}
//           <button
//             onClick={handleClose}
//             style={{
//               width: "100%",
//               padding: "14px",
//               background: "#F3F4F6",
//               color: "#374151",
//               border: "none",
//               borderRadius: "12px",
//               fontSize: "16px",
//               fontWeight: "600",
//               cursor: "pointer",
//               marginTop: "15px"
//             }}
//           >
//             Close & End Session
//           </button>
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         @keyframes scaleIn {
//           0% { transform: scale(0); opacity: 0; }
//           100% { transform: scale(1); opacity: 1; }
//         }
//         @keyframes slideUp {
//           0% { transform: translateY(30px); opacity: 0; }
//           100% { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes pulse {
//           0%, 100% { transform: scale(1); }
//           50% { transform: scale(1.05); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default FacultyQRGeneratorScreen;


import { useState, useEffect } from 'react';

const EnhancedFacultyQRGenerator = () => {
  const [timeRemaining, setTimeRemaining] = useState(240);
  const [progress, setProgress] = useState(100);
  const [pulseScale, setPulseScale] = useState(1);

  const attendanceCode = "ATD7K9";
  const subject = { name: "Data Structures", code: "CS201" };

  useEffect(() => {
    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Progress calculation
    const progressInterval = setInterval(() => {
      setProgress((timeRemaining / 240) * 100);
    }, 100);

    // Pulse animation for timer
    const pulseInterval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.05 : 1);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(progressInterval);
      clearInterval(pulseInterval);
    };
  }, [timeRemaining]);

  const getTimerColor = () => {
    if (timeRemaining > 160) return { main: '#10B981', glow: 'rgba(16,185,129,0.4)' };
    if (timeRemaining > 80) return { main: '#F59E0B', glow: 'rgba(245,158,11,0.4)' };
    return { main: '#EF4444', glow: 'rgba(239,68,68,0.4)' };
  };

  const colors = getTimerColor();
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(102,126,234,0.05) 50px, rgba(102,126,234,0.05) 51px),
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(102,126,234,0.05) 50px, rgba(102,126,234,0.05) 51px)
        `,
        animation: 'gridFlow 20s linear infinite',
        transform: 'perspective(500px) rotateX(60deg)',
        transformOrigin: 'center bottom'
      }} />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: colors.main,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 20 + 10}px ${colors.main}`,
            animation: `floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.6
          }}
        />
      ))}

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '20px',
        background: 'linear-gradient(180deg, rgba(10,14,39,0.9) 0%, transparent 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(102,126,234,0.2)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <button style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '15px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            ← Back
          </button>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '5px'
            }}>
              {subject.name}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)'
            }}>
              {subject.code} • Session Active
            </div>
          </div>

          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.main}, ${colors.main}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            boxShadow: `0 10px 40px ${colors.glow}`,
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            📡
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Left Column - Timer and Code */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            animation: 'slideInLeft 0.8s ease-out'
          }}>
            {/* Countdown Timer */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(30px)',
              border: `2px solid ${colors.main}60`,
              borderRadius: '30px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: `0 20px 60px ${colors.glow}, inset 0 0 50px rgba(255,255,255,0.05)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Animated rings */}
              <div style={{
                position: 'absolute',
                width: '250px',
                height: '250px',
                border: `2px solid ${colors.main}30`,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'rotateRing 10s linear infinite'
              }} />
              <div style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                border: `2px dashed ${colors.main}40`,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'rotateRing 15s linear infinite reverse'
              }} />

              <div style={{
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '20px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  Time Remaining
                </div>

                <div style={{
                  width: '180px',
                  height: '180px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.main}40, ${colors.main}20)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `3px solid ${colors.main}`,
                  boxShadow: `0 0 60px ${colors.glow}, inset 0 0 30px ${colors.glow}`,
                  position: 'relative',
                  transform: `scale(${pulseScale})`,
                  transition: 'transform 0.3s ease'
                }}>
                  {/* Circular progress */}
                  <svg style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: 'rotate(-90deg)'
                  }}>
                    <circle
                      cx="90"
                      cy="90"
                      r="85"
                      stroke={colors.main}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${progress * 5.34} 534`}
                      strokeLinecap="round"
                      style={{
                        filter: `drop-shadow(0 0 10px ${colors.main})`,
                        transition: 'stroke-dasharray 0.3s ease'
                      }}
                    />
                  </svg>

                  <div style={{
                    fontSize: '56px',
                    fontWeight: '900',
                    color: 'white',
                    lineHeight: '1',
                    fontFamily: 'monospace',
                    textShadow: `0 0 20px ${colors.glow}`
                  }}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: '10px',
                    fontWeight: '600'
                  }}>
                    MINUTES : SECONDS
                  </div>
                </div>

                {timeRemaining <= 30 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(239,68,68,0.2)',
                    border: '1px solid #EF4444',
                    borderRadius: '15px',
                    color: '#EF4444',
                    fontSize: '14px',
                    fontWeight: '600',
                    animation: 'shake 0.5s ease-in-out infinite'
                  }}>
                    ⚠️ Code expiring soon!
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Code */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(102,126,234,0.4)',
              borderRadius: '25px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(102,126,234,0.3)'
            }}>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '15px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                Attendance Code
              </div>

              <div style={{
                fontSize: '56px',
                fontWeight: '900',
                color: 'white',
                letterSpacing: '12px',
                fontFamily: 'monospace',
                textShadow: '0 0 30px rgba(102,126,234,0.8)',
                marginBottom: '15px',
                animation: 'glow 2s ease-in-out infinite'
              }}>
                {attendanceCode}
              </div>

              <div style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: '500'
              }}>
                Students can enter this code manually
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div style={{
            animation: 'slideInRight 0.8s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(30px)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '30px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Animated corner decorations */}
              {[
                { top: '20px', left: '20px', rotate: '0deg' },
                { top: '20px', right: '20px', rotate: '90deg' },
                { bottom: '20px', left: '20px', rotate: '270deg' },
                { bottom: '20px', right: '20px', rotate: '180deg' }
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    ...pos,
                    width: '40px',
                    height: '40px',
                    border: '3px solid #667eea',
                    borderBottom: 'none',
                    borderRight: 'none',
                    borderRadius: '5px 0 0 0',
                    transform: `rotate(${pos.rotate})`,
                    animation: `pulse 2s ease-in-out infinite ${i * 0.2}s`
                  }}
                />
              ))}

              <div style={{
                fontSize: '18px',
                color: 'white',
                fontWeight: '700',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>📱</span>
                Scan with Mobile
              </div>

              {/* QR Code Container with holographic effect */}
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '25px',
                display: 'inline-block',
                boxShadow: `
                  0 30px 80px rgba(0,0,0,0.5),
                  0 0 0 10px rgba(255,255,255,0.1),
                  0 0 80px rgba(102,126,234,0.4)
                `,
                position: 'relative',
                animation: 'float 3s ease-in-out infinite'
              }}>
                {/* QR Code placeholder */}
                <div style={{
                  width: '300px',
                  height: '300px',
                  background: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                  backgroundSize: '40px 40px',
                  backgroundPosition: '0 0, 20px 20px',
                  borderRadius: '15px',
                  position: 'relative'
                }}>
                  {/* Center logo */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '80px',
                    background: 'white',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
                  }}>
                    ✓
                  </div>
                </div>

                {/* Scanning animation overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
                  boxShadow: '0 0 20px #667eea',
                  animation: 'scan 3s ease-in-out infinite'
                }} />
              </div>

              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 20px #10B981',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
                <div style={{
                  flex: 1,
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#10B981',
                    marginBottom: '4px'
                  }}>
                    Session Active
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    Students can mark attendance now
                  </div>
                </div>
                <div style={{ fontSize: '24px' }}>
                  ✅
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <button style={{
                padding: '18px',
                background: 'linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.2) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(102,126,234,0.4)',
                borderRadius: '15px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                📊 View Records
              </button>

              <button style={{
                padding: '18px',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.2) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '15px',
                color: '#EF4444',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                ❌ End Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gridFlow {
          from {
            transform: perspective(500px) rotateX(60deg) translateY(0);
          }
          to {
            transform: perspective(500px) rotateX(60deg) translateY(50px);
          }
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
          50% {
            transform: translate(100px, -100px);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes rotateRing {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 30px rgba(102,126,234,0.8);
          }
          50% {
            text-shadow: 0 0 50px rgba(102,126,234,1), 0 0 80px rgba(102,126,234,0.6);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes scan {
          0%, 100% {
            top: 0;
          }
          50% {
            top: calc(100% - 4px);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedFacultyQRGenerator;