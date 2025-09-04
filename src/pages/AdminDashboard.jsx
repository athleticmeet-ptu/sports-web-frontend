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
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

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

  // Stats: session-wise and sport-level position counts
  const [positionStats, setPositionStats] = useState({ session: {}, levels: { international: {"1st":0,"2nd":0,"3rd":0}, national: {"1st":0,"2nd":0,"3rd":0}, state:{"1st":0,"2nd":0,"3rd":0}, ptu:{"1st":0,"2nd":0,"3rd":0} } });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

 // New states
const [sessions, setSessions] = useState([]);
const [selectedSession, setSelectedSession] = useState("");
const [students, setStudents] = useState([]);
const [studentsLoading, setStudentsLoading] = useState(true);





  useEffect(() => {
  const loadSessions = async () => {
    try {
      const res = await API.get("/admin/sessions");
      setSessions(res.data || []);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };
  loadSessions();
}, []);

useEffect(() => {
  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await API.get("/admin/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setStudentsLoading(false);
    }
  };
  loadStudents();
}, []);

// Filter + aggregate by selected session
const genderData = React.useMemo(() => {
  if (!selectedSession) return [];
  const filtered = students.filter(st => st.session?._id === selectedSession);

  let male = 0, female = 0;
  filtered.forEach(st => {
    if (st.gender?.toLowerCase() === "male") male++;
    if (st.gender?.toLowerCase() === "female") female++;
  });

  return [{ name: "Students", Male: male, Female: female }];
}, [students, selectedSession]);

  
  
  

  useEffect(() => {
    // Loader simulate (jab API lagoge toh yaha loading control karna)
    const timer = setTimeout(() => setLoading(false), 1500);
    
    // Fetch recent activities
    fetchRecentActivities();
    
    // Fetch pending positions
    fetchPendingPositions();
    
    // Fetch pending approvals
    fetchPendingApprovals();
    fetchPositionStats();
    
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

  const classifyLevel = (sport) => {
    if (!sport) return 'ptu';
    const s = String(sport);
    if (/international/i.test(s)) return 'international';
    if (/national|inter\s*university/i.test(s)) return 'national';
    if (/state|inter\s*college|ptu|university/i.test(s)) return 'ptu';
  };

  const fetchPositionStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const res = await API.get('/admin/students');
      const students = res.data || [];
      const sessionMap = {};
      const levels = { international: {"1st":0,"2nd":0,"3rd":0}, national: {"1st":0,"2nd":0,"3rd":0},ptu:{"1st":0,"2nd":0,"3rd":0} };

      students.forEach(st => {
        const sessionName = st.session?.session || 'Unknown';
        if (!sessionMap[sessionName]) sessionMap[sessionName] = {"1st":0,"2nd":0,"3rd":0, participated:0};
        (st.positions || []).forEach(pos => {
          const p = (pos?.position || '').toLowerCase();
          const norm = p.includes('1')? '1st' : p.includes('2')? '2nd' : p.includes('3')? '3rd' : p.includes('particip')? 'participated' : '';
          if (!norm) return;
          sessionMap[sessionName][norm] = (sessionMap[sessionName][norm] || 0) + 1;
          const lvl = classifyLevel(pos?.sport || '');
          if (norm !== 'participated' && levels[lvl] && levels[lvl][norm] !== undefined) {
            levels[lvl][norm] += 1;
          }
        });
      });

      setPositionStats({ session: sessionMap, levels });
    } catch (e) {
      setStatsError('Failed to load position stats');
    } finally {
      setStatsLoading(false);
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
      <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
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
                <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
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
        {/* Position Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Students - Positions Overview
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchPositionStats} disabled={statsLoading}>
                  <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : statsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">{statsError}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Session-wise */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Session-wise</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(positionStats.session).map(([sess, counts]) => (
                        <div key={sess} className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm font-medium text-foreground">{sess}</span>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>1st: <span className="text-foreground font-semibold">{counts['1st']||0}</span></span>
                            <span>2nd: <span className="text-foreground font-semibold">{counts['2nd']||0}</span></span>
                            <span>3rd: <span className="text-foreground font-semibold">{counts['3rd']||0}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Sport level */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">By Level (PTU Intercollege, National, International)</h4>
                    <div className="space-y-2">
                      {['ptu','national','international'].map(level => (
                        <div key={level} className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm font-medium capitalize text-foreground">{level}</span>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>1st: <span className="text-foreground font-semibold">{positionStats.levels[level]?.['1st']||0}</span></span>
                            <span>2nd: <span className="text-foreground font-semibold">{positionStats.levels[level]?.['2nd']||0}</span></span>
                            <span>3rd: <span className="text-foreground font-semibold">{positionStats.levels[level]?.['3rd']||0}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
         <Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Performance Analytics
      </div>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="mb-4">
      <select
        value={selectedSession}
        onChange={(e) => setSelectedSession(e.target.value)}
        className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
      >
        <option value="">-- Select Session --</option>
        {sessions.map((s) => (
          <option key={s._id} value={s._id}>
            {s.session}
          </option>
        ))}
      </select>
    </div>

    {studentsLoading ? (
      <div className="flex items-center justify-center h-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    ) : !selectedSession ? (
      <p className="text-muted-foreground text-center h-40 flex items-center justify-center">
        Please select a session
      </p>
    ) : genderData.length > 0 ? (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={genderData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Male" fill="#3b82f6" />
            <Bar dataKey="Female" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <p className="text-muted-foreground text-center h-40 flex items-center justify-center">
        No student data available for this session
      </p>
    )}
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
