// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminSessionManager from './pages/AdminSessionManager';
import ProtectedRoute from './components/ProtectedRoute';
import AdminApprovalDashboard from './pages/AdminApprovalDashboard';
import StudentProfileForm from './pages/StudentProfileForm';
import CaptainDashboard from './pages/CaptainDashboard';




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/captain" element={<CaptainDashboard />} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfileForm /></ProtectedRoute>} />
<Route path="/admin/approvals" element={<ProtectedRoute role="admin"><AdminApprovalDashboard /></ProtectedRoute>} />
       <Route
  path="/admin/session"
  element={
    <ProtectedRoute role="admin">
      <AdminSessionManager />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
