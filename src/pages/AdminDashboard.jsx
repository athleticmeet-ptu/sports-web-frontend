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
      </div>
    </div>
  );
}

export default AdminDashboard;
