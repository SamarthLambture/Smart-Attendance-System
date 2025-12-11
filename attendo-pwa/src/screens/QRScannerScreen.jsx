// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import jsQR from "jsqr";

// const QRScannerScreen = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { subject, rollNumber } = location.state || {};
  
//   const [scanning, setScanning] = useState(false);
//   const [error, setError] = useState("");
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const animationRef = useRef(null);
//   const mountedRef = useRef(true);

//   useEffect(() => {
//     mountedRef.current = true;
    
//     // Request permission first on mobile
//     requestCameraPermission();
    
//     return () => {
//       mountedRef.current = false;
//       stopCamera();
//     };
//   }, []);

//   const requestCameraPermission = async () => {
//     try {
//       // CRITICAL: Check if getUserMedia API is available
//       if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//         // API not available - this happens on HTTP connections on mobile
//         const httpsError = new Error("HTTPS_REQUIRED");
//         httpsError.name = "SecurityError";
//         httpsError.message = `🔒 Secure Connection Required

// Camera access requires HTTPS on mobile browsers.

// Current URL: ${window.location.protocol}//${window.location.host}

// Solutions:
// 1. Ask your admin to enable HTTPS
// 2. Or use "Enter Code Manually" below`;
        
//         if (mountedRef.current) {
//           handleCameraError(httpsError);
//         }
//         return;
//       }
      
//       // On mobile, we need to request permission explicitly
//       // This shows the permission dialog
//       const testStream = await navigator.mediaDevices.getUserMedia({ 
//         video: true 
//       });
      
//       // Permission granted, stop test stream
//       testStream.getTracks().forEach(track => track.stop());
      
//       if (mountedRef.current) {
//         setPermissionGranted(true);
//         // Small delay to ensure permission dialog is closed
//         setTimeout(() => {
//           startCamera();
//         }, 300);
//       }
//     } catch (err) {
//       console.error("Permission error:", err);
//       if (mountedRef.current) {
//         handleCameraError(err);
//       }
//     }
//   };

//   const startCamera = async () => {
//     try {
//       if (!mountedRef.current) return;
      
//       setError("");
      
//       // Mobile-optimized constraints
//       // Start with very basic constraints for maximum compatibility
//       let constraints = {
//         video: {
//           facingMode: "environment", // Back camera
//           width: { ideal: 640, max: 1280 },
//           height: { ideal: 480, max: 720 }
//         },
//         audio: false
//       };

//       let stream = null;

//       try {
//         // Try with back camera first
//         stream = await navigator.mediaDevices.getUserMedia(constraints);
//       } catch (err) {
//         console.log("Back camera failed, trying front camera:", err);
        
//         // Try front camera
//         try {
//           constraints = {
//             video: {
//               facingMode: "user",
//               width: { ideal: 640 },
//               height: { ideal: 480 }
//             },
//             audio: false
//           };
//           stream = await navigator.mediaDevices.getUserMedia(constraints);
//         } catch (err2) {
//           console.log("Front camera with constraints failed, trying basic:", err2);
          
//           // Last resort: absolute minimum constraints
//           stream = await navigator.mediaDevices.getUserMedia({ 
//             video: true,
//             audio: false
//           });
//         }
//       }

//       if (!mountedRef.current || !stream) {
//         if (stream) {
//           stream.getTracks().forEach(track => track.stop());
//         }
//         return;
//       }

//       streamRef.current = stream;

//       if (videoRef.current) {
//         // Mobile-specific video setup
//         videoRef.current.srcObject = stream;
        
//         // Critical for mobile browsers
//         videoRef.current.setAttribute("playsinline", "");
//         videoRef.current.setAttribute("webkit-playsinline", "");
//         videoRef.current.setAttribute("autoplay", "");
//         videoRef.current.setAttribute("muted", "");
//         videoRef.current.muted = true;
//         videoRef.current.playsInline = true;

//         // Wait for video to be ready
//         const handleVideoReady = () => {
//           if (!mountedRef.current || !videoRef.current) return;

//           // Force play on mobile
//           const playPromise = videoRef.current.play();
          
//           if (playPromise !== undefined) {
//             playPromise
//               .then(() => {
//                 if (mountedRef.current) {
//                   console.log("Video playing successfully");
//                   setScanning(true);
//                   setError("");
//                   // Give video a moment to stabilize before scanning
//                   setTimeout(() => {
//                     if (mountedRef.current) {
//                       scanQRCode();
//                     }
//                   }, 500);
//                 }
//               })
//               .catch(err => {
//                 console.error("Play error:", err);
//                 if (mountedRef.current) {
//                   // Try to play again after a delay
//                   setTimeout(() => {
//                     if (mountedRef.current && videoRef.current) {
//                       videoRef.current.play().catch(e => {
//                         setError("Unable to start video preview. Please refresh and try again.");
//                       });
//                     }
//                   }, 500);
//                 }
//               });
//           }
//         };

//         // Multiple event listeners for better mobile compatibility
//         videoRef.current.onloadedmetadata = handleVideoReady;
//         videoRef.current.oncanplay = handleVideoReady;
        
//         // Fallback timeout
//         setTimeout(handleVideoReady, 1000);
//       }
//     } catch (err) {
//       console.error("Camera start error:", err);
//       if (mountedRef.current) {
//         handleCameraError(err);
//       }
//     }
//   };

//   const handleCameraError = (err) => {
//     let errorMessage = "";
    
//     if (err.name === 'SecurityError' || err.message.includes("HTTPS") || err.message.includes("mediaDevices")) {
//       // This is the main issue on mobile HTTP
//       errorMessage = `🔒 Camera Requires Secure Connection

// Your current connection: HTTP (not secure)
// Camera API needs: HTTPS (secure)

// ⚠️ This is why webcamtest.com works but your app doesn't - they use HTTPS!

// Solutions:
// 1. Ask your developer to enable HTTPS
// 2. OR use "Enter Code Manually" button below (works on any connection)

// Technical: navigator.mediaDevices requires HTTPS on mobile browsers for security.`;
//     } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
//       errorMessage = `📱 Camera Permission Denied

// To fix:
// 1. Firefox Menu (⋮) → Settings
// 2. Site Permissions → Camera
// 3. Set to "Allow" for this site
// 4. Refresh this page

// OR use "Enter Code Manually" below`;
//     } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
//       errorMessage = "No camera detected on this device.";
//     } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
//       errorMessage = "Camera is being used by another app. Please close other apps and try again.";
//     } else if (err.name === 'OverconstrainedError') {
//       errorMessage = "Camera settings not supported. Trying simpler settings...";
//       // Auto-retry with basic settings
//       setTimeout(() => {
//         if (mountedRef.current) {
//           startCameraBasic();
//         }
//       }, 1000);
//       return;
//     } else {
//       errorMessage = `Camera error: ${err.message || "Unknown error"}

// Try refreshing the page or use 'Enter Code Manually' button below.`;
//     }
    
//     setError(errorMessage);
//   };

//   const startCameraBasic = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: true,
//         audio: false
//       });
      
//       if (!mountedRef.current) {
//         stream.getTracks().forEach(track => track.stop());
//         return;
//       }
      
//       streamRef.current = stream;
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await videoRef.current.play();
//         setScanning(true);
//         setError("");
//         setTimeout(() => scanQRCode(), 500);
//       }
//     } catch (err) {
//       handleCameraError(err);
//     }
//   };

//   const scanQRCode = () => {
//     if (!mountedRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (!video || !canvas) {
//       animationRef.current = requestAnimationFrame(scanQRCode);
//       return;
//     }

//     // Wait for video to have data
//     if (video.readyState !== video.HAVE_ENOUGH_DATA) {
//       animationRef.current = requestAnimationFrame(scanQRCode);
//       return;
//     }

//     try {
//       // Set canvas size to match video
//       if (canvas.width !== video.videoWidth) {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//       }

//       const context = canvas.getContext("2d", { willReadFrequently: true });
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
//       const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//       const code = jsQR(imageData.data, imageData.width, imageData.height, {
//         inversionAttempts: "dontInvert",
//       });

//       if (code && code.data) {
//         console.log("QR Code detected:", code.data);
//         handleQRCodeDetected(code.data);
//         return;
//       }
//     } catch (err) {
//       console.error("Scan error:", err);
//     }

//     // Continue scanning
//     animationRef.current = requestAnimationFrame(scanQRCode);
//   };

//   const handleQRCodeDetected = (qrData) => {
//     stopCamera();
    
//     navigate("/code-entry", { 
//       state: { 
//         scannedCode: qrData,
//         subject,
//         rollNumber 
//       } 
//     });
//   };

//   const stopCamera = () => {
//     if (animationRef.current) {
//       cancelAnimationFrame(animationRef.current);
//       animationRef.current = null;
//     }

//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => {
//         track.stop();
//       });
//       streamRef.current = null;
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//       videoRef.current.pause();
//     }

//     setScanning(false);
//   };

//   const handleManualEntry = () => {
//     stopCamera();
//     navigate("/code-entry", { 
//       state: { subject, rollNumber } 
//     });
//   };

//   const handleBack = () => {
//     stopCamera();
//     navigate("/student-home");
//   };

//   const handleRetry = () => {
//     setError("");
//     setScanning(false);
//     stopCamera();
//     setTimeout(() => {
//       requestCameraPermission();
//     }, 300);
//   };

//   return (
//     <div style={{
//       position: "fixed",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       background: "#000",
//       display: "flex",
//       flexDirection: "column",
//       zIndex: 9999,
//       overflow: "hidden",
//       touchAction: "none"
//     }}>
//       {/* Header */}
//       <div style={{
//         padding: "15px 20px",
//         background: "rgba(0,0,0,0.9)",
//         zIndex: 10,
//         flexShrink: 0
//       }}>
//         <button
//           onClick={handleBack}
//           style={{
//             background: "rgba(255,255,255,0.2)",
//             border: "none",
//             color: "white",
//             padding: "12px 24px",
//             borderRadius: "10px",
//             fontSize: "16px",
//             fontWeight: "600",
//             cursor: "pointer",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             WebkitTapHighlightColor: "transparent"
//           }}
//         >
//           ← Back
//         </button>
//       </div>

//       {/* Scanner Area */}
//       <div style={{
//         flex: 1,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "10px",
//         position: "relative",
//         overflow: "hidden"
//       }}>
//         {/* Video Container */}
//         <div style={{
//           position: "relative",
//           width: "100%",
//           maxWidth: "500px",
//           aspectRatio: "4/3",
//           borderRadius: "12px",
//           overflow: "hidden",
//           background: "#1a1a1a"
//         }}>
//           <video
//             ref={videoRef}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//               display: "block"
//             }}
//             playsInline
//             muted
//             autoPlay
//           />
          
//           {/* Scanning Frame Overlay */}
//           {scanning && (
//             <div style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: "70%",
//               maxWidth: "250px",
//               aspectRatio: "1",
//               border: "3px solid rgba(102, 126, 234, 0.8)",
//               borderRadius: "12px",
//               boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
//               pointerEvents: "none",
//               zIndex: 2
//             }}>
//               {/* Corner Decorations */}
//               {[
//                 { top: -3, left: -3, borderTop: "6px solid #667eea", borderLeft: "6px solid #667eea", borderRadius: "12px 0 0 0" },
//                 { top: -3, right: -3, borderTop: "6px solid #667eea", borderRight: "6px solid #667eea", borderRadius: "0 12px 0 0" },
//                 { bottom: -3, left: -3, borderBottom: "6px solid #667eea", borderLeft: "6px solid #667eea", borderRadius: "0 0 0 12px" },
//                 { bottom: -3, right: -3, borderBottom: "6px solid #667eea", borderRight: "6px solid #667eea", borderRadius: "0 0 12px 0" }
//               ].map((style, i) => (
//                 <div key={i} style={{
//                   position: "absolute",
//                   width: "30px",
//                   height: "30px",
//                   ...style
//                 }}></div>
//               ))}
//             </div>
//           )}

//           {/* Loading State */}
//           {!scanning && !error && (
//             <div style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               textAlign: "center",
//               color: "white",
//               zIndex: 3
//             }}>
//               <div style={{
//                 width: "50px",
//                 height: "50px",
//                 border: "5px solid rgba(255,255,255,0.3)",
//                 borderTop: "5px solid white",
//                 borderRadius: "50%",
//                 animation: "spin 1s linear infinite",
//                 margin: "0 auto 15px"
//               }}></div>
//               <div style={{ fontSize: "14px", fontWeight: "600" }}>
//                 {permissionGranted ? "Starting camera..." : "Requesting permission..."}
//               </div>
//               <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8 }}>
//                 Please allow camera access
//               </div>
//             </div>
//           )}

//           {/* Error State */}
//           {error && (
//             <div style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: "90%",
//               maxWidth: "400px",
//               zIndex: 3
//             }}>
//               <div style={{
//                 background: "rgba(220, 38, 38, 0.95)",
//                 color: "white",
//                 padding: "20px",
//                 borderRadius: "12px",
//                 textAlign: "center"
//               }}>
//                 <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
//                   ⚠️ Camera Error
//                 </div>
//                 <div style={{ 
//                   fontSize: "14px", 
//                   lineHeight: "1.6", 
//                   whiteSpace: "pre-line",
//                   marginBottom: "15px"
//                 }}>
//                   {error}
//                 </div>
//                 <div style={{
//                   display: "flex",
//                   gap: "10px",
//                   justifyContent: "center",
//                   flexWrap: "wrap"
//                 }}>
//                   <button
//                     onClick={handleRetry}
//                     style={{
//                       background: "white",
//                       color: "#DC2626",
//                       border: "none",
//                       padding: "10px 20px",
//                       borderRadius: "8px",
//                       fontSize: "14px",
//                       fontWeight: "600",
//                       cursor: "pointer",
//                       WebkitTapHighlightColor: "transparent"
//                     }}
//                   >
//                     Try Again
//                   </button>
//                   <button
//                     onClick={handleManualEntry}
//                     style={{
//                       background: "rgba(255,255,255,0.2)",
//                       color: "white",
//                       border: "2px solid white",
//                       padding: "10px 20px",
//                       borderRadius: "8px",
//                       fontSize: "14px",
//                       fontWeight: "600",
//                       cursor: "pointer",
//                       WebkitTapHighlightColor: "transparent"
//                     }}
//                   >
//                     Enter Code
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Hidden canvas for QR processing */}
//         <canvas ref={canvasRef} style={{ display: "none" }} />

//         {/* Status Text */}
//         {scanning && !error && (
//           <div style={{
//             marginTop: "20px",
//             textAlign: "center",
//             color: "white",
//             maxWidth: "90%",
//             animation: "fadeIn 0.5s"
//           }}>
//             <div style={{ 
//               fontSize: "18px", 
//               fontWeight: "600", 
//               marginBottom: "8px",
//               textShadow: "0 2px 10px rgba(0,0,0,0.8)"
//             }}>
//               📷 Scanning for QR Code
//             </div>
//             <div style={{ 
//               fontSize: "14px", 
//               opacity: 0.9,
//               textShadow: "0 2px 10px rgba(0,0,0,0.8)",
//               lineHeight: "1.5"
//             }}>
//               Position QR code in the blue frame
//             </div>
//             {subject && (
//               <div style={{ 
//                 fontSize: "12px", 
//                 opacity: 0.8,
//                 marginTop: "8px",
//                 textShadow: "0 2px 10px rgba(0,0,0,0.8)"
//               }}>
//                 {subject.name} ({subject.code})
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div style={{
//         padding: "15px 20px",
//         background: "rgba(0,0,0,0.9)",
//         flexShrink: 0
//       }}>
//         <button
//           onClick={handleManualEntry}
//           style={{
//             width: "100%",
//             maxWidth: "500px",
//             margin: "0 auto",
//             display: "block",
//             background: "white",
//             color: "#374151",
//             border: "none",
//             padding: "16px",
//             borderRadius: "12px",
//             fontSize: "16px",
//             fontWeight: "600",
//             cursor: "pointer",
//             boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
//             WebkitTapHighlightColor: "transparent"
//           }}
//         >
//           Enter Code Manually
//         </button>
//       </div>

//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default QRScannerScreen;


import { useState, useEffect } from 'react';

const EnhancedQRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [corners, setCorners] = useState([
    { x: 35, y: 35 },
    { x: 65, y: 35 },
    { x: 35, y: 65 },
    { x: 65, y: 65 }
  ]);

  useEffect(() => {
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => (prev + 5) % 100);
    }, 100);

    // Animate corner indicators
    const cornerInterval = setInterval(() => {
      setCorners(prev => prev.map(corner => ({
        x: corner.x + (Math.random() - 0.5) * 0.5,
        y: corner.y + (Math.random() - 0.5) * 0.5
      })));
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(cornerInterval);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header with glassmorphism */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        animation: 'slideDown 0.5s ease-out'
      }}>
        <button style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '15px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: '20px' }}>←</span>
          Back
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '4px'
          }}>
            QR Code Scanner
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            Position QR code within the frame
          </div>
        </div>

        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: scanning 
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
            : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          animation: scanning ? 'pulse 2s ease-in-out infinite' : 'none'
        }}>
          📷
        </div>
      </div>

      {/* Scanner Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(102,126,234,0.1) 0%, transparent 70%)'
      }}>
        {/* Animated grid overlay */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(102,126,234,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102,126,234,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'gridScan 2s linear infinite',
          opacity: 0.5
        }} />

        {/* Camera viewfinder */}
        <div style={{
          position: 'relative',
          width: '85%',
          maxWidth: '400px',
          aspectRatio: '1',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '30px',
          overflow: 'hidden',
          boxShadow: `
            0 0 0 2px rgba(102,126,234,0.3),
            0 0 80px rgba(102,126,234,0.3),
            inset 0 0 50px rgba(0,0,0,0.5)
          `
        }}>
          {/* Video placeholder with scan lines */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            position: 'relative'
          }}>
            {/* Scanning beam */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #667eea, #764ba2, #667eea, transparent)',
              top: `${scanProgress}%`,
              boxShadow: '0 0 30px rgba(102,126,234,0.8)',
              transition: 'top 0.1s linear',
              animation: 'glow 1s ease-in-out infinite'
            }} />

            {/* Corner markers with dynamic positioning */}
            {corners.map((corner, index) => {
              const positions = [
                { top: '20px', left: '20px', rotate: '0deg' },
                { top: '20px', right: '20px', rotate: '90deg' },
                { bottom: '20px', left: '20px', rotate: '270deg' },
                { bottom: '20px', right: '20px', rotate: '180deg' }
              ];

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    ...positions[index],
                    width: '50px',
                    height: '50px',
                    transform: `rotate(${positions[index].rotate})`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    width: '30px',
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea, transparent)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(102,126,234,0.8)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    width: '4px',
                    height: '30px',
                    background: 'linear-gradient(180deg, #667eea, transparent)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(102,126,234,0.8)'
                  }} />
                </div>
              );
            })}

            {/* Center crosshair */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              border: '2px solid rgba(102,126,234,0.5)',
              borderRadius: '50%',
              animation: 'pulseRing 2s ease-in-out infinite'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                background: 'radial-gradient(circle, #667eea 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'ping 2s ease-in-out infinite'
              }} />
            </div>

            {/* Particle effects */}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '3px',
                  height: '3px',
                  background: '#667eea',
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: '0 0 10px rgba(102,126,234,0.8)',
                  animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Scanning overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(102,126,234,0.1) 50%, transparent 100%)',
            pointerEvents: 'none',
            animation: 'scanOverlay 3s linear infinite'
          }} />
        </div>

        {/* Status indicators around scanner */}
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
          animation: 'fadeIn 1s ease-out 0.5s backwards'
        }}>
          {['📡', '🎯', '⚡'].map((icon, i) => (
            <div
              key={i}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                animation: `bounce 2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div style={{
        background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        backdropFilter: 'blur(20px)',
        padding: '25px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        animation: 'slideUp 0.5s ease-out'
      }}>
        {/* Scanning status */}
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 20px rgba(16,185,129,0.8)',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#10B981',
              marginBottom: '4px'
            }}>
              Scanning Active
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.7)'
            }}>
              Hold steady for best results
            </div>
          </div>
          <div style={{
            fontSize: '24px'
          }}>
            📊
          </div>
        </div>

        {/* Manual entry button */}
        <button style={{
          width: '100%',
          padding: '18px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          color: 'white',
          fontSize: '16px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>⌨️</span>
          Enter Code Manually
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes gridScan {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(30px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(102,126,234,0.8);
          }
          50% {
            box-shadow: 0 0 50px rgba(102,126,234,1);
          }
        }

        @keyframes pulseRing {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.5;
          }
        }

        @keyframes ping {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes scanOverlay {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedQRScanner;