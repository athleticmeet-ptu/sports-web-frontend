import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Users, 
  Crown, 
  CheckCircle, 
  Activity, 
  Swimming, 
  Target, 
  Download, 
  Award, 
  BarChart3,
  RefreshCw,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";
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
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Welcome Admin 👋</h1>
        <p className="text-muted-foreground mt-2">Manage your sports administration system</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Pending Positions
                </div>
                <Button 
                  onClick={fetchPendingPositions}
                  disabled={pendingPositionsLoading}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <RefreshCw className={`w-4 h-4 ${pendingPositionsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPositionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : pendingPositionsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive mb-4">{pendingPositionsError}</p>
                  <Button 
                    onClick={fetchPendingPositions}
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              ) : pendingPositions.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {pendingPositions.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-muted rounded-lg border-l-4 border-primary"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {item.type === 'student' ? (
                            <Users className="w-4 h-4 text-primary" />
                          ) : (
                            <Crown className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            URN: {item.urn} • {item.branch}, {item.year}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Sport: {item.sport} • Position: {item.position}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No pending positions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Pending Approvals
                </div>
                <Button 
                  onClick={fetchPendingApprovals}
                  disabled={pendingApprovalsLoading}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <RefreshCw className={`w-4 h-4 ${pendingApprovalsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApprovalsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : pendingApprovalsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive mb-4">{pendingApprovalsError}</p>
                  <Button 
                    onClick={fetchPendingApprovals}
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              ) : (pendingTeams.length > 0 || pendingProfiles.length > 0) ? (
                <div className="space-y-4 max-h-48 overflow-y-auto">
                  {/* Pending Teams Section */}
                  {pendingTeams.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-primary" />
                        Pending Teams ({pendingTeams.length})
                      </h4>
                      <div className="space-y-2">
                        {pendingTeams.map((team, index) => (
                          <motion.div
                            key={team._id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500"
                          >
                            <div className="flex items-start gap-2">
                              <Crown className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm">
                                  {team.captainId?.name || 'Unknown Captain'}
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">
                                  Sport: {team.captainId?.sport || 'N/A'} • Team: {team.captainId?.teamName || 'N/A'}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Session: {team.sessionId?.session || 'N/A'} • Members: {team.members?.length || 0}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                
                  {/* Pending Profiles Section */}
                  {pendingProfiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Pending Profiles ({pendingProfiles.length})
                      </h4>
                      <div className="space-y-2">
                        {pendingProfiles.map((profile, index) => (
                          <motion.div
                            key={profile._id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500"
                          >
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-green-600 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm">
                                  {profile.name || 'Unknown Student'}
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">
                                  URN: {profile.urn || 'N/A'} • {profile.branch || 'N/A'}, {profile.year || 'N/A'}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  {profile.pendingPersonal && (
                                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                                      Personal
                                    </span>
                                  )}
                                  {profile.pendingSports && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                      Sports
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Chart / Graph Placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Activities
                  {!activitiesLoading && !activitiesError && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {recentActivities.length}
                    </span>
                  )}
                </div>
                <Button 
                  onClick={fetchRecentActivities}
                  disabled={activitiesLoading}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <RefreshCw className={`w-4 h-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : activitiesError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive mb-4">{activitiesError}</p>
                  <Button 
                    onClick={fetchRecentActivities}
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-muted rounded-lg border-l-4 border-primary"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm flex items-center gap-2">
                            <span className="text-lg">{formatAction(activity.action).icon}</span>
                            {formatAction(activity.action).text}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            {activity.description || 'No description available'}
                          </p>
                          {activity.targetModel && (
                            <p className="text-muted-foreground text-xs mt-1">
                              {activity.targetModel}
                              {activity.targetId && ` • ID: ${activity.targetId}`}
                            </p>
                          )}
                          {activity.admin && (
                            <p className="text-muted-foreground text-xs mt-1">
                              Admin: {activity.admin.name || activity.admin.email}
                            </p>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs flex-shrink-0">
                          {activity.createdAt ? formatTimestamp(activity.createdAt) : 'No timestamp'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboard;
