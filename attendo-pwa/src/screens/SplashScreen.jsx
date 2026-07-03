import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnhancedSplashScreen = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Simulate navigation after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/user-selection');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Animated background particles */}
      {[...Array(30)].map((_, i) => (
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
            boxShadow: '0 0 20px rgba(102,126,234,0.8)',
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.6
          }}
        />
      ))}

      {/* Glowing circles background */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        animation: 'fadeIn 1s ease-out'
      }}>
        {/* Logo container with glow effect */}
        <div style={{
          width: '150px',
          height: '150px',
          margin: '0 auto 40px',
          position: 'relative',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))',
            filter: 'blur(20px)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />

          {/* Logo circle */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(102,126,234,0.5)',
            border: '3px solid rgba(255,255,255,0.1)'
          }}>
            {/* Checkmark icon */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: 'draw 1.5s ease-out forwards 0.5s'
                }}
              />
            </svg>
          </div>
        </div>

        {/* App title */}
        <h1 style={{
          fontSize: 'clamp(42px, 8vw, 56px)',
          fontWeight: '900',
          color: 'white',
          margin: '0 0 15px 0',
          letterSpacing: '2px',
          textShadow: '0 0 40px rgba(102,126,234,0.8)',
          animation: 'slideUp 0.8s ease-out 0.3s backwards'
        }}>
          Attendo
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 3vw, 20px)',
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 50px 0',
          fontWeight: '500',
          animation: 'slideUp 0.8s ease-out 0.5s backwards'
        }}>
          Smart Attendance System
        </p>

        {/* Loading bar */}
        <div style={{
          width: '200px',
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          margin: '0 auto',
          overflow: 'hidden',
          animation: 'slideUp 0.8s ease-out 0.7s backwards'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
            backgroundSize: '200% 100%',
            borderRadius: '10px',
            animation: 'loading 2s ease-in-out infinite, shimmer 1.5s linear infinite'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
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

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
          50% {
            transform: translate(100px, -100px);
            opacity: 1;
          }
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes loading {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedSplashScreen;