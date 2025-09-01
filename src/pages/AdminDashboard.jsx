import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);
  
  // New state for pending positions
  const [pendingPositions, setPendingPositions] = useState([]);
  const [pendingPositionsLoading, setPendingPositionsLoading] = useState(true);
  const [pendingPositionsError, setPendingPositionsError] = useState(null);
  
  // New state for pending approvals
  const [pendingTeams, setPendingTeams] = useState([]);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState(true);
  const [pendingApprovalsError, setPendingApprovalsError] = useState(null);

  useEffect(() => {
    // Loader simulate (jab API lagoge toh yaha loading control karna)
    const timer = setTimeout(() => setLoading(false), 1500);
    
    // Fetch recent activities
    fetchRecentActivities();
    
    // Fetch pending positions
    fetchPendingPositions();
    
    // Fetch pending approvals
    fetchPendingApprovals();
    
    return () => clearTimeout(timer);
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      console.log('Fetching recent activities...');
      const response = await API.get('/recent-activities?limit=20');
      console.log('Recent activities response:', response.data);
      if (response.data.success) {
        setRecentActivities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setActivitiesError('Failed to load recent activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchPendingPositions = async () => {
    try {
      setPendingPositionsLoading(true);
      setPendingPositionsError(null);
  
      // Fetch both students and captains
      const [studentsResponse, captainsResponse] = await Promise.all([
        API.get('/admin/students'),
        API.get('/admin/captains')
      ]);
  
      const students = studentsResponse.data || [];
      const captains = captainsResponse.data || [];
  
             // 🔹 Filter students with pending positions
       const pendingStudents = students.filter(student => {
         // null/undefined/empty array => pending
         if (!student.positions || !Array.isArray(student.positions) || student.positions.length === 0) return true;
   
         // check if any pos = null/empty/pending
         return student.positions.some(pos =>
           !pos || !pos.position || pos.position === "pending" || pos.position === ""
         );
       });
  
      // 🔹 Filter captains with pending positions
      const pendingCaptains = captains.filter(captain =>
        !captain.position || captain.position === "pending" || captain.position === ""
      );
  
      // 🔹 Merge and format the results
      const mergedPending = [
        ...pendingStudents.map(student => ({
          id: student._id,
          name: student.name,
          urn: student.urn,
          type: 'student',
                     sport: (student.positions && Array.isArray(student.positions) && student.positions.length > 0)
             ? (student.positions.find(pos =>
                 pos && (!pos.position || pos.position === "pending" || pos.position === "")
               )?.sport || 'N/A')
             : 'N/A',
          position: 'pending',
          branch: student.branch,
          year: student.year
        })),
        ...pendingCaptains.map(captain => ({
          id: captain._id,
          name: captain.name,
          urn: captain.urn,
          type: 'captain',
          sport: captain.sport || 'N/A',
          position: captain.position || 'pending',
          branch: captain.branch,
          year: captain.year
        }))
      ];
  
      setPendingPositions(mergedPending);
    } catch (error) {
      console.error('Error fetching pending positions:', error);
      setPendingPositionsError('Failed to load pending positions');
    } finally {
      setPendingPositionsLoading(false);
    }
  };
  

  const fetchPendingApprovals = async () => {
    try {
      setPendingApprovalsLoading(true);
      setPendingApprovalsError(null);
      
      // Fetch both pending teams and pending profiles
      const [teamsResponse, profilesResponse] = await Promise.all([
        API.get('/admin/pending-teams'),
        API.get('/admin/pending-profiles')
      ]);

      const teams = teamsResponse.data || [];
      const profiles = profilesResponse.data || [];

      setPendingTeams(teams);
      setPendingProfiles(profiles);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setPendingApprovalsError('Failed to load pending approvals');
    } finally {
      setPendingApprovalsLoading(false);
    }
  };

  // Convert action enum to readable text and get icon
  const formatAction = (action) => {
    const actionMap = {
      'CREATE_STUDENT': { text: 'Created Student', icon: '👤' },
      'CREATE_CAPTAIN': { text: 'Created Captain', icon: '👑' },
      'ASSIGN_POSITION_STUDENT': { text: 'Assigned Position to Student', icon: '🎯' },
      'ASSIGN_POSITION_CAPTAIN_TEAM': { text: 'Assigned Team Position', icon: '🏆' },
      'APPROVE_CAPTAIN': { text: 'Approved Captain', icon: '✅' },
      'APPROVE_STUDENT': { text: 'Approved Student', icon: '✅' },
      'MARK_ATTENDANCE_GYM': { text: 'Marked Gym Attendance', icon: '💪' },
      'MARK_ATTENDANCE_SWIMMING': { text: 'Marked Swimming Attendance', icon: '🏊' },
      'EDIT_CAPTAIN': { text: 'Edited Captain', icon: '✏️' },
      'DELETE_CAPTAIN': { text: 'Deleted Captain', icon: '🗑️' },
      'EDIT_TEAM_MEMBER': { text: 'Edited Team Member', icon: '✏️' },
      'DELETE_TEAM_MEMBER': { text: 'Deleted Team Member', icon: '🗑️' },
      'EDIT_STUDENT': { text: 'Edited Student', icon: '✏️' },
      'DELETE_STUDENT': { text: 'Deleted Student', icon: '🗑️' },
      'SEND_CERTIFICATE': { text: 'Sent Certificate', icon: '🏅' },
      'SESSION_CREATED': { text: 'Created Session', icon: '📅' },
      'SESSION_DELETED': { text: 'Deleted Session', icon: '🗑️' },
      'SESSION_ACTIVATED': { text: 'Activated Session', icon: '🚀' },
      'OTHER': { text: 'Other Action', icon: '⚡' }
    };
    return actionMap[action] || { text: action, icon: '⚡' };
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-600">Pending Positions</h3>
              <button 
                onClick={fetchPendingPositions}
                disabled={pendingPositionsLoading}
                className="p-1 text-orange-500 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh pending positions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            {pendingPositionsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-orange-500 border-dashed rounded-full animate-spin"></div>
              </div>
            ) : pendingPositionsError ? (
              <div className="text-center text-red-500 py-8">
                <p className="mb-2">{pendingPositionsError}</p>
                <button 
                  onClick={fetchPendingPositions}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                >
                  Retry
                </button>
              </div>
            ) : pendingPositions.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {pendingPositions.map((item, index) => (
                  <div key={item.id || index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                          <span>{item.type === 'student' ? '👤' : '👑'}</span>
                          {item.name}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          URN: {item.urn}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Sport: {item.sport}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Position: {item.position}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Branch: {item.branch}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Year: {item.year}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No pending positions available</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-600">Pending Approvals</h3>
              <button 
                onClick={fetchPendingApprovals}
                disabled={pendingApprovalsLoading}
                className="p-1 text-orange-500 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh pending approvals"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            {pendingApprovalsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-orange-500 border-dashed rounded-full animate-spin"></div>
              </div>
            ) : pendingApprovalsError ? (
              <div className="text-center text-red-500 py-8">
                <p className="mb-2">{pendingApprovalsError}</p>
                <button 
                  onClick={fetchPendingApprovals}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                >
                  Retry
                </button>
              </div>
            ) : (pendingTeams.length > 0 || pendingProfiles.length > 0) ? (
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {/* Pending Teams Section */}
                {pendingTeams.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>👑</span>
                      Pending Teams ({pendingTeams.length})
                    </h4>
                    <div className="space-y-2">
                      {pendingTeams.map((team, index) => (
                        <div key={team._id || index} className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <p className="font-medium text-gray-800 text-xs flex items-center gap-2">
                            <span>🏆</span>
                            {team.captainId?.name || 'Unknown Captain'}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            Sport: {team.captainId?.sport || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            Team: {team.captainId?.teamName || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            Session: {team.sessionId?.session || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            Members: {team.members?.length || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pending Profiles Section */}
                {pendingProfiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>👤</span>
                      Pending Profiles ({pendingProfiles.length})
                    </h4>
                    <div className="space-y-2">
                      {pendingProfiles.map((profile, index) => (
                        <div key={profile._id || index} className="p-2 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <p className="font-medium text-gray-800 text-xs flex items-center gap-2">
                            <span>📝</span>
                            {profile.name || 'Unknown Student'}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            URN: {profile.urn || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            Branch: {profile.branch || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            Year: {profile.year || 'N/A'}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {profile.pendingPersonal && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                Personal
                              </span>
                            )}
                            {profile.pendingSports && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                Sports
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No pending approvals</p>
              </div>
            )}
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-orange-600">Recent Activities</h3>
                {!activitiesLoading && !activitiesError && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    {recentActivities.length}
                  </span>
                )}
              </div>
              <button 
                onClick={fetchRecentActivities}
                disabled={activitiesLoading}
                className="p-1 text-orange-500 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh activities"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            {activitiesLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-orange-500 border-dashed rounded-full animate-spin"></div>
              </div>
            ) : activitiesError ? (
              <div className="text-center text-red-500 py-8">
                <p className="mb-2">{activitiesError}</p>
                <button 
                  onClick={fetchRecentActivities}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                >
                  Retry
                </button>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <div key={activity._id || index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                          <span>{formatAction(activity.action).icon}</span>
                          {formatAction(activity.action).text}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          {activity.description || 'No description available'}
                        </p>
                        {activity.targetModel && (
                          <p className="text-gray-500 text-xs mt-1">
                            {activity.targetModel}
                            {activity.targetId && ` • ID: ${activity.targetId}`}
                          </p>
                        )}
                        {activity.admin && (
                          <p className="text-gray-400 text-xs mt-1">
                            Admin: {activity.admin.name || activity.admin.email}
                          </p>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs ml-2">
                        {activity.createdAt ? formatTimestamp(activity.createdAt) : 'No timestamp'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No recent activities</p>
              </div>
            )}
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
