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
        <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔹 Gradient Navbar */}
      <nav className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between flex-wrap">
          {/* Logo */}
          <h1 className="text-2xl font-bold tracking-wide">Admin Dashboard</h1>

          {/* Links */}
          <div className="flex flex-wrap gap-4 mt-3 md:mt-0">
            <Link to="/admin/create-student" className="nav-link">Create Student</Link>
            <Link to="/admin/create-teacher" className="nav-link">Create Teacher</Link>
            <Link to="/admin/create-captain" className="nav-link">Create Captain</Link>
            <Link to="/admin/session" className="nav-link">Manage Sessions</Link>
            <Link to="/admin/approvals" className="nav-link">Approve Teams</Link>
            <Link to="/admin/captains" className="nav-link">Captains & Teams</Link>
            <Link to="/admin/students" className="nav-link">Manage Students</Link>
            <Link to="/admin/gym-attendance" className="nav-link">Gym-Attendance</Link>
            <Link to="/admin/swimming-attendance" className="nav-link">Swimming-Attendance</Link>
            <Link to="/admin/assign-position" className="nav-link">Assign Positions</Link>
            <Link to="/admin/assign-team-position" className="nav-link">Team Position</Link>
            <Link to="/admin/export" className="nav-link">Export Students</Link>
            <Link to="/admin/export-captains" className="nav-link">Export Captains</Link>
            <Link to="/admin/issue-cert" className="nav-link">Certificates</Link>
            <Link to="/admin/score" className="nav-link">Score Matrix</Link>
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
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-orange-600">Pending Positions</h3>
            <p className="text-gray-600">10 positions pending approval</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-orange-600">Teams Overview</h3>
            <p className="text-gray-600">5 active teams</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2 text-orange-600">Attendance</h3>
            <p className="text-gray-600">75% average attendance</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">Performance Analytics</h3>
            <div className="h-40 flex items-center justify-center text-gray-500">
              📊 Chart / Graph Placeholder
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">Recent Activity</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✔️ Student "Rahul" created</li>
              <li>✔️ Teacher "Mr. Singh" added</li>
              <li>✔️ Team "Warriors" approved</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Extra Tailwind CSS for nav-link */}
      <style>
        {`
          .nav-link {
            position: relative;
            padding: 6px 12px;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-weight: 500;
          }
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
    </div>
  );
}

export default AdminDashboard;
