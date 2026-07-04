import { useState } from 'react';
import { useNavigate } from "react-router-dom";


const EnhancedUserSelection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(102,126,234,0.03) 50px, rgba(102,126,234,0.03) 51px),
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(102,126,234,0.03) 50px, rgba(102,126,234,0.03) 51px)
        `,
        animation: 'gridFlow 20s linear infinite'
      }} />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: '#667eea',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 15px rgba(102,126,234,0.6)',
            animation: `floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.5
          }}
        />
      ))}

      {/* Content container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '500px'
      }}>
        {/* Logo section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          animation: 'fadeInDown 0.8s ease-out'
        }}>
          {/* Logo circle with glow */}
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 30px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))',
              filter: 'blur(25px)',
              animation: 'pulse 3s ease-in-out infinite'
            }} />
            
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
              border: '3px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(102,126,234,0.4)'
            }}>
              ✓
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 48px)',
            fontWeight: '900',
            color: 'white',
            margin: '0 0 12px 0',
            letterSpacing: '1px',
            textShadow: '0 0 30px rgba(102,126,234,0.6)'
          }}>
            Attendo
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            fontWeight: '500'
          }}>
            Who are you?
          </p>
        </div>

        {/* Selection cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'fadeInUp 0.8s ease-out 0.3s backwards'
        }}>
          {/* Student card */}
          <div
            onMouseEnter={() => setHoveredCard('student')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate("/student-login")}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoveredCard === 'student' ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredCard === 'student' 
                ? '0 30px 80px rgba(102,126,234,0.4), 0 0 0 1px rgba(102,126,234,0.5)' 
                : '0 10px 40px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Hover gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              opacity: hoveredCard === 'student' ? 1 : 0,
              transition: 'opacity 0.4s ease',
              pointerEvents: 'none'
            }} />

            {/* Icon */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              flexShrink: 0,
              boxShadow: '0 10px 30px rgba(102,126,234,0.4)',
              transform: hoveredCard === 'student' ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.4s ease',
              position: 'relative',
              zIndex: 1
            }}>
              👤
            </div>

            {/* Text */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: 'clamp(20px, 4vw, 24px)',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 6px 0'
              }}>
                I'm a Student
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                margin: 0
              }}>
                Mark your attendance
              </p>
            </div>

            {/* Arrow */}
            <div style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.4)',
              transform: hoveredCard === 'student' ? 'translateX(5px)' : 'translateX(0)',
              transition: 'all 0.4s ease',
              position: 'relative',
              zIndex: 1
            }}>
              →
            </div>
          </div>

          {/* Faculty card */}
          <div
            onMouseEnter={() => setHoveredCard('faculty')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate("/faculty-login")}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoveredCard === 'faculty' ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredCard === 'faculty' 
                ? '0 30px 80px rgba(236,72,153,0.4), 0 0 0 1px rgba(236,72,153,0.5)' 
                : '0 10px 40px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Hover gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(190,24,93,0.1) 100%)',
              opacity: hoveredCard === 'faculty' ? 1 : 0,
              transition: 'opacity 0.4s ease',
              pointerEvents: 'none'
            }} />

            {/* Icon */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              flexShrink: 0,
              boxShadow: '0 10px 30px rgba(236,72,153,0.4)',
              transform: hoveredCard === 'faculty' ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.4s ease',
              position: 'relative',
              zIndex: 1
            }}>
              👨‍🏫
            </div>

            {/* Text */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <h3 style={{
                fontSize: 'clamp(20px, 4vw, 24px)',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 6px 0'
              }}>
                I'm a Faculty
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                margin: 0
              }}>
                Manage attendance
              </p>
            </div>

            {/* Arrow */}
            <div style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.4)',
              transform: hoveredCard === 'faculty' ? 'translateX(5px)' : 'translateX(0)',
              transition: 'all 0.4s ease',
              position: 'relative',
              zIndex: 1
            }}>
              →
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p style={{
          textAlign: 'center',
          marginTop: '40px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.3)',
          animation: 'fadeIn 1s ease-out 0.8s backwards'
        }}>
          Secure • Fast • Reliable
        </p>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes gridFlow {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(50px);
          }
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.5;
          }
          50% {
            transform: translate(100px, -100px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedUserSelection;