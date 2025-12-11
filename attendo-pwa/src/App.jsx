import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Student Screens
import SplashScreen from './screens/SplashScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';
import StudentLoginScreen from './screens/StudentLoginScreen';
import StudentRegisterScreen from './screens/StudentRegisterScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import SubjectSelectionScreen from './screens/SubjectSelectionScreen';
import StudentHomeScreen from './screens/StudentHomeScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import CodeEntryScreen from './screens/CodeEntryScreen';
import AttendanceFormScreen from './screens/AttendanceFormScreen';
import StudentProfileScreen from './screens/StudentProfileScreen';

// Faculty Screens
import FacultyLoginScreen from './screens/FacultyLoginScreen';
import FacultyRegisterScreen from './screens/FacultyRegisterScreen';
import FacultyOTPVerificationScreen from './screens/FacultyOTPVerificationScreen';
import FacultySubjectSelectionScreen from './screens/FacultySubjectSelectionScreen';
import FacultyHomeScreen from './screens/FacultyHomeScreen';
import FacultyQRGeneratorScreen from './screens/FacultyQRGeneratorScreen';
import FacultyAttendanceRegisterScreen from './screens/FacultyAttendanceRegisterScreen';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/user-selection" element={<UserSelectionScreen />} />
          
          {/* Student Authentication Routes */}
          <Route path="/student-login" element={<StudentLoginScreen />} />
          <Route path="/student-register" element={<StudentRegisterScreen />} />
          <Route path="/verify-otp" element={<OTPVerificationScreen />} />
          <Route path="/select-subjects" element={<SubjectSelectionScreen />} />
          
          {/* Student App Routes */}
          <Route path="/student-home" element={<StudentHomeScreen />} />
          <Route path="/qr-scanner" element={<QRScannerScreen />} />
          <Route path="/code-entry" element={<CodeEntryScreen />} />
          <Route path="/attendance-form" element={<AttendanceFormScreen />} />
          <Route path="/student-profile" element={<StudentProfileScreen />} />
          
          {/* Faculty Authentication Routes */}
          <Route path="/faculty-login" element={<FacultyLoginScreen />} />
          <Route path="/faculty-register" element={<FacultyRegisterScreen />} />
          <Route path="/faculty-verify-otp" element={<FacultyOTPVerificationScreen />} />
          <Route path="/faculty-select-subjects" element={<FacultySubjectSelectionScreen />} />
          
          {/* Faculty App Routes */}
          <Route path="/faculty-home" element={<FacultyHomeScreen />} />
          <Route path="/faculty-qr-generator" element={<FacultyQRGeneratorScreen />} />
          <Route path="/faculty-attendance-register" element={<FacultyAttendanceRegisterScreen />} />
          
          {/* Catch all - redirect to splash */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;