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
import CreateStudent from './pages/CreateStudent';
import CreateTeacher from './pages/CreateTeacher';
import CreateCaptain from './pages/CreateCaptain';
import StudentDetails from './pages/StudentDetails';
import CaptainsAndTeams from "./pages/CaptainsAndTeams";
import AllStudents from './pages/AllStudents';
import GymAttendanceDashboard from './pages/GymAttendanceDashboard';
import SwimmingAttendanceDashboard from './pages/SwimmingAttendanceDashboard';
import AdminAssignPosition from './pages/AdminAssignPosition';
import AssignPosition from './pages/AssignPosition';
import StudentExport from './pages/Export';
import CaptainExport from './pages/CaptainExport';
import Certificate from './pages/Certificate';
import CaptainListCert from './pages/CaptainListCert';
import StudentsTable from './pages/Scorematrix';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={ <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute role="admin"><AllStudents /></ProtectedRoute>} />
<Route path="/admin/captains" element={<CaptainsAndTeams />} />
<Route path="/admin/student/:id" element={<StudentDetails />} />
        <Route
          path="/admin/gym-attendance"
          element={
            <ProtectedRoute role="admin">
              <GymAttendanceDashboard />
            </ProtectedRoute>
          }
          
        />
                <Route
          path="/admin/swimming-attendance"
          element={
            <ProtectedRoute role="admin">
              <SwimmingAttendanceDashboard />
            </ProtectedRoute>
          }
          
        />
                <Route
          path="/admin/export-captains"
          element={
            <ProtectedRoute role="admin">
              <CaptainExport />
            </ProtectedRoute>
          }
          
        />
        <Route
          path="/admin/export"
          element={
            <ProtectedRoute role="admin">
              <StudentExport />
            </ProtectedRoute>
          }
        />
<Route
  path="/admin/certificates/:captainId"
  element={
    <ProtectedRoute role="admin">
      <Certificate />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/score"
  element={
    <ProtectedRoute role="admin">
      <StudentsTable />
    </ProtectedRoute>
  }
/>

                        <Route
          path="/admin/issue-cert"
          element={
            <ProtectedRoute role="admin">
              <CaptainListCert />
            </ProtectedRoute>
          }
          
        />
<Route path="/admin/create-student" element={<ProtectedRoute role="admin"><CreateStudent /></ProtectedRoute>} />
<Route path="/admin/create-teacher" element={<ProtectedRoute role="admin"><CreateTeacher /></ProtectedRoute>} />
<Route path="/admin/create-captain" element={<ProtectedRoute role="admin"><CreateCaptain /></ProtectedRoute>} />
 <Route path="/admin/assign-team-position" element={<ProtectedRoute role="admin"><AssignPosition/></ProtectedRoute>} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/captain" element={<CaptainDashboard />} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfileForm /></ProtectedRoute>} />
<Route path="/admin/approvals" element={<ProtectedRoute role="admin"><AdminApprovalDashboard /></ProtectedRoute>} />
<Route path="/admin/assign-position" element={<ProtectedRoute role="admin"><AdminAssignPosition /></ProtectedRoute>} />
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
