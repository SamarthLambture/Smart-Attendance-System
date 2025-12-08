// FILE: src/screens/SplashScreen.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/user-selection');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content fade-in">
        <div className="splash-icon-container bounce">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="45" fill="white" />
            <path
              d="M50 25L60 45L80 50L60 55L50 75L40 55L20 50L40 45L50 25Z"
              fill="#4F46E5"
            />
            <circle cx="50" cy="50" r="15" fill="#4F46E5" />
            <path
              d="M45 50L48 53L55 46"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="splash-title">Attendo</h1>
        <p className="splash-subtitle">Smart Attendance System</p>
        <div className="splash-loader">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;