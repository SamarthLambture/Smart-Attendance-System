import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsQR from "jsqr";

const QRScannerScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, rollNumber } = location.state || {};
  
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    // Request permission first on mobile
    requestCameraPermission();
    
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      // CRITICAL: Check if getUserMedia API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // API not available - this happens on HTTP connections on mobile
        const httpsError = new Error("HTTPS_REQUIRED");
        httpsError.name = "SecurityError";
        httpsError.message = `🔒 Secure Connection Required

Camera access requires HTTPS on mobile browsers.

Current URL: ${window.location.protocol}//${window.location.host}

Solutions:
1. Ask your admin to enable HTTPS
2. Or use "Enter Code Manually" below`;
        
        if (mountedRef.current) {
          handleCameraError(httpsError);
        }
        return;
      }
      
      // On mobile, we need to request permission explicitly
      // This shows the permission dialog
      const testStream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      // Permission granted, stop test stream
      testStream.getTracks().forEach(track => track.stop());
      
      if (mountedRef.current) {
        setPermissionGranted(true);
        // Small delay to ensure permission dialog is closed
        setTimeout(() => {
          startCamera();
        }, 300);
      }
    } catch (err) {
      console.error("Permission error:", err);
      if (mountedRef.current) {
        handleCameraError(err);
      }
    }
  };

  const startCamera = async () => {
    try {
      if (!mountedRef.current) return;
      
      setError("");
      
      // Mobile-optimized constraints
      // Start with very basic constraints for maximum compatibility
      let constraints = {
        video: {
          facingMode: "environment", // Back camera
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        },
        audio: false
      };

      let stream = null;

      try {
        // Try with back camera first
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.log("Back camera failed, trying front camera:", err);
        
        // Try front camera
        try {
          constraints = {
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err2) {
          console.log("Front camera with constraints failed, trying basic:", err2);
          
          // Last resort: absolute minimum constraints
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
          });
        }
      }

      if (!mountedRef.current || !stream) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        // Mobile-specific video setup
        videoRef.current.srcObject = stream;
        
        // Critical for mobile browsers
        videoRef.current.setAttribute("playsinline", "");
        videoRef.current.setAttribute("webkit-playsinline", "");
        videoRef.current.setAttribute("autoplay", "");
        videoRef.current.setAttribute("muted", "");
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;

        // Wait for video to be ready
        const handleVideoReady = () => {
          if (!mountedRef.current || !videoRef.current) return;

          // Force play on mobile
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (mountedRef.current) {
                  console.log("Video playing successfully");
                  setScanning(true);
                  setError("");
                  // Give video a moment to stabilize before scanning
                  setTimeout(() => {
                    if (mountedRef.current) {
                      scanQRCode();
                    }
                  }, 500);
                }
              })
              .catch(err => {
                console.error("Play error:", err);
                if (mountedRef.current) {
                  // Try to play again after a delay
                  setTimeout(() => {
                    if (mountedRef.current && videoRef.current) {
                      videoRef.current.play().catch(e => {
                        setError("Unable to start video preview. Please refresh and try again.");
                      });
                    }
                  }, 500);
                }
              });
          }
        };

        // Multiple event listeners for better mobile compatibility
        videoRef.current.onloadedmetadata = handleVideoReady;
        videoRef.current.oncanplay = handleVideoReady;
        
        // Fallback timeout
        setTimeout(handleVideoReady, 1000);
      }
    } catch (err) {
      console.error("Camera start error:", err);
      if (mountedRef.current) {
        handleCameraError(err);
      }
    }
  };

  const handleCameraError = (err) => {
    let errorMessage = "";
    
    if (err.name === 'SecurityError' || err.message.includes("HTTPS") || err.message.includes("mediaDevices")) {
      // This is the main issue on mobile HTTP
      errorMessage = `🔒 Camera Requires Secure Connection

Your current connection: HTTP (not secure)
Camera API needs: HTTPS (secure)

⚠️ This is why webcamtest.com works but your app doesn't - they use HTTPS!

Solutions:
1. Ask your developer to enable HTTPS
2. OR use "Enter Code Manually" button below (works on any connection)

Technical: navigator.mediaDevices requires HTTPS on mobile browsers for security.`;
    } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage = `📱 Camera Permission Denied

To fix:
1. Firefox Menu (⋮) → Settings
2. Site Permissions → Camera
3. Set to "Allow" for this site
4. Refresh this page

OR use "Enter Code Manually" below`;
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      errorMessage = "No camera detected on this device.";
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      errorMessage = "Camera is being used by another app. Please close other apps and try again.";
    } else if (err.name === 'OverconstrainedError') {
      errorMessage = "Camera settings not supported. Trying simpler settings...";
      // Auto-retry with basic settings
      setTimeout(() => {
        if (mountedRef.current) {
          startCameraBasic();
        }
      }, 1000);
      return;
    } else {
      errorMessage = `Camera error: ${err.message || "Unknown error"}

Try refreshing the page or use 'Enter Code Manually' button below.`;
    }
    
    setError(errorMessage);
  };

  const startCameraBasic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        setError("");
        setTimeout(() => scanQRCode(), 500);
      }
    } catch (err) {
      handleCameraError(err);
    }
  };

  const scanQRCode = () => {
    if (!mountedRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    // Wait for video to have data
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    try {
      // Set canvas size to match video
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        console.log("QR Code detected:", code.data);
        handleQRCodeDetected(code.data);
        return;
      }
    } catch (err) {
      console.error("Scan error:", err);
    }

    // Continue scanning
    animationRef.current = requestAnimationFrame(scanQRCode);
  };

  const handleQRCodeDetected = (qrData) => {
    stopCamera();
    
    navigate("/code-entry", { 
      state: { 
        scannedCode: qrData,
        subject,
        rollNumber 
      } 
    });
  };

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }

    setScanning(false);
  };

  const handleManualEntry = () => {
    stopCamera();
    navigate("/code-entry", { 
      state: { subject, rollNumber } 
    });
  };

  const handleBack = () => {
    stopCamera();
    navigate("/student-home");
  };

  const handleRetry = () => {
    setError("");
    setScanning(false);
    stopCamera();
    setTimeout(() => {
      requestCameraPermission();
    }, 300);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "#000",
      display: "flex",
      flexDirection: "column",
      zIndex: 9999,
      overflow: "hidden",
      touchAction: "none"
    }}>
      {/* Header */}
      <div style={{
        padding: "15px 20px",
        background: "rgba(0,0,0,0.9)",
        zIndex: 10,
        flexShrink: 0
      }}>
        <button
          onClick={handleBack}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          ← Back
        </button>
      </div>

      {/* Scanner Area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Video Container */}
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px",
          aspectRatio: "4/3",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#1a1a1a"
        }}>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            }}
            playsInline
            muted
            autoPlay
          />
          
          {/* Scanning Frame Overlay */}
          {scanning && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "70%",
              maxWidth: "250px",
              aspectRatio: "1",
              border: "3px solid rgba(102, 126, 234, 0.8)",
              borderRadius: "12px",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              zIndex: 2
            }}>
              {/* Corner Decorations */}
              {[
                { top: -3, left: -3, borderTop: "6px solid #667eea", borderLeft: "6px solid #667eea", borderRadius: "12px 0 0 0" },
                { top: -3, right: -3, borderTop: "6px solid #667eea", borderRight: "6px solid #667eea", borderRadius: "0 12px 0 0" },
                { bottom: -3, left: -3, borderBottom: "6px solid #667eea", borderLeft: "6px solid #667eea", borderRadius: "0 0 0 12px" },
                { bottom: -3, right: -3, borderBottom: "6px solid #667eea", borderRight: "6px solid #667eea", borderRadius: "0 0 12px 0" }
              ].map((style, i) => (
                <div key={i} style={{
                  position: "absolute",
                  width: "30px",
                  height: "30px",
                  ...style
                }}></div>
              ))}
            </div>
          )}

          {/* Loading State */}
          {!scanning && !error && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "white",
              zIndex: 3
            }}>
              <div style={{
                width: "50px",
                height: "50px",
                border: "5px solid rgba(255,255,255,0.3)",
                borderTop: "5px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 15px"
              }}></div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>
                {permissionGranted ? "Starting camera..." : "Requesting permission..."}
              </div>
              <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8 }}>
                Please allow camera access
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "400px",
              zIndex: 3
            }}>
              <div style={{
                background: "rgba(220, 38, 38, 0.95)",
                color: "white",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
                  ⚠️ Camera Error
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  lineHeight: "1.6", 
                  whiteSpace: "pre-line",
                  marginBottom: "15px"
                }}>
                  {error}
                </div>
                <div style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={handleRetry}
                    style={{
                      background: "white",
                      color: "#DC2626",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent"
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleManualEntry}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                      border: "2px solid white",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent"
                    }}
                  >
                    Enter Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Status Text */}
        {scanning && !error && (
          <div style={{
            marginTop: "20px",
            textAlign: "center",
            color: "white",
            maxWidth: "90%",
            animation: "fadeIn 0.5s"
          }}>
            <div style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              marginBottom: "8px",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)"
            }}>
              📷 Scanning for QR Code
            </div>
            <div style={{ 
              fontSize: "14px", 
              opacity: 0.9,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              lineHeight: "1.5"
            }}>
              Position QR code in the blue frame
            </div>
            {subject && (
              <div style={{ 
                fontSize: "12px", 
                opacity: 0.8,
                marginTop: "8px",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)"
              }}>
                {subject.name} ({subject.code})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "15px 20px",
        background: "rgba(0,0,0,0.9)",
        flexShrink: 0
      }}>
        <button
          onClick={handleManualEntry}
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto",
            display: "block",
            background: "white",
            color: "#374151",
            border: "none",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          Enter Code Manually
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QRScannerScreen;