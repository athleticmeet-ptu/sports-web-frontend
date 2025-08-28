import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Loader simulate (jab API lagoge toh yaha loading control karna)
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔹 Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="space-x-4 flex flex-wrap gap-2">
            <Link to="/admin/create-student" className="hover:underline">Create Student</Link>
            <Link to="/admin/create-teacher" className="hover:underline">Create Teacher</Link>
            <Link to="/admin/create-captain" className="hover:underline">Create Captain</Link>
            <Link to="/admin/session" className="hover:underline">Manage Sessions</Link>
            <Link to="/admin/approvals" className="hover:underline">Approve Teams</Link>
            <Link to="/admin/captains" className="hover:underline">View Captains & Teams</Link>
            <Link to="/admin/students" className="hover:underline">Manage Students</Link>
            <Link to="/admin/attendance" className="hover:underline">Attendance</Link>
            <Link to="/admin/assign-position" className="hover:underline">Assign Student Positions</Link>
            <Link to="/admin/assign-team-position" className="hover:underline">Assign Team Position</Link>
            <Link to="/admin/export" className="hover:underline">Export Students</Link>
            <Link to="/admin/export-captains" className="hover:underline">Export Captains</Link>
            <Link to="/admin/issue-cert" className="hover:underline">Certificates</Link>
            <Link to="/admin/score" className="hover:underline">Score Matrix</Link>
          </div>
        </div>
      </nav>

      {/* 🔹 Dashboard Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Welcome Admin 👋
        </h2>

        {/* Blocks Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">Pending Positions</h3>
            <p className="text-gray-600">10 positions pending approval</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">Teams Overview</h3>
            <p className="text-gray-600">5 active teams</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">Attendance</h3>
            <p className="text-gray-600">75% average attendance</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
            <div className="h-40 flex items-center justify-center text-gray-500">
              📊 Chart / Graph Placeholder
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✔️ Student "Rahul" created</li>
              <li>✔️ Teacher "Mr. Singh" added</li>
              <li>✔️ Team "Warriors" approved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
