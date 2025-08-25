import React from 'react';
import { Link } from 'react-router-dom';
function AdminDashboard() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* Navigation Links */}
      <div className="space-y-3">
        <Link
          to="/admin/create-student"
          className="block bg-blue-600 text-white px-4 py-2 rounded text-center"
        >
          Create Student
        </Link>

        <Link
          to="/admin/create-teacher"
          className="block bg-green-600 text-white px-4 py-2 rounded text-center"
        >
          Create Teacher
        </Link>

        <Link
          to="/admin/create-captain"
          className="block bg-purple-600 text-white px-4 py-2 rounded text-center"
        >
          Create Captain
        </Link>

        <Link
          to="/admin/session"
          className="block bg-yellow-500 text-white px-4 py-2 rounded text-center"
        >
          Manage Sessions
        </Link>

        <Link
          to="/admin/approvals"
          className="block bg-red-500 text-white px-4 py-2 rounded text-center"
        >
          Approve Teams
        </Link>

        {/* NEW: Captains + Teams Section */}
        <Link
          to="/admin/captains"
          className="block bg-indigo-600 text-white px-4 py-2 rounded text-center"
        >
          View Captains & Teams
        </Link>
        <Link
  to="/admin/students"
  className="bg-indigo-600 text-white px-4 py-2 rounded"
>
  Manage Students
</Link>
  <Link
          to="/admin/attendance"
          className="block bg-indigo-600 text-white px-4 py-2 rounded text-center"
        >
          Attendance
        </Link>
                <Link to="/admin/assign-position" className="text-blue-600 hover:underline">
                Assign Student Positions
              </Link>
              <Link to="/admin/assign-team-position" className="text-blue-600 hover:underline">
              assign team position
              </Link>
              <Link to="/admin/export" className="text-blue-600 hover:underline">
              export intercollege students
              </Link>
                <Link to="/admin/export-captains" className="text-blue-600 hover:underline">
              export interyear students
              </Link>
                <Link to="/admin/issue-cert" className="text-blue-600 hover:underline">
              Certificates 
              </Link>
                 <Link to="/admin/score" className="text-blue-600 hover:underline">
              score matrix 
              </Link>
              
      </div>
    </div>
  );
}

export default AdminDashboard;
