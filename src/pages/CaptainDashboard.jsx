// src/pages/CaptainDashboard.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';

function CaptainDashboard() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSessionObj, setSelectedSessionObj] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await API.get('/session');
      const data = res.data || [];
      setSessions(data);

      const active = data.find(s => s.isActive);
      if (active) {
        setSelectedSession(active._id);
        setSelectedSessionObj(active);
      }
    } catch {
      setErr('Failed to load sessions.');
    }
  };

  const fetchTeamInfo = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setErr('');

    try {
      const res = await API.get(`/captain/my-team?sessionId=${sessionId}`);
      const teamData = res.data?.team || null;
      const sessionObj = sessions.find(s => s._id === sessionId);
      setSelectedSessionObj(sessionObj);

      // Form rules:
      // - If no team exists and session is active → show form
      // - If team exists but status is pending → show "waiting for approval"
      // - If team approved → show team info
      // - If session inactive → only show team if approved
      if (!teamData && sessionObj?.isActive) {
        setIsFirstTime(true);
        setTeamInfo(null);
      } else {
        setIsFirstTime(false);
        setTeamInfo(teamData);
      }
    } catch {
      setErr('Failed to load team info.');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const formData = {
        teamName: e.target.teamName.value,
        sport: e.target.sport.value,
        members: e.target.members.value.split(',').map(m => m.trim()),
        sessionId: selectedSession,
        status: 'pending' // 🚀 mark as pending until admin approves
      };
      await API.post('/captain/my-team', formData);
      fetchTeamInfo(selectedSession);
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to save team.');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTeamInfo(selectedSession);
    }
  }, [selectedSession, sessions]);

  if (loading && !teamInfo && !isFirstTime) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Captain Dashboard</h2>
      {err && <p className="text-red-500 mb-2">{err}</p>}

      {/* Session Selector */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Session</label>
        <select
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Select Session --</option>
          {sessions.map(s => (
            <option key={s._id} value={s._id}>
              {s.session} {s.isActive ? '(Active)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Show form if first time & active session */}
      {isFirstTime ? (
        <div className="max-w-xl">
          <h3 className="text-lg font-semibold mb-3">Create Your Team</h3>
          <form onSubmit={handleFirstTimeSubmit} className="space-y-3">
            <input name="teamName" placeholder="Team Name" className="w-full border p-2" required />
            <input name="sport" placeholder="Sport" className="w-full border p-2" required />
            <textarea
              name="members"
              placeholder="Comma separated member names"
              className="w-full border p-2"
              required
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          </form>
        </div>
      ) : (
        teamInfo && (
          <div className="border p-4 rounded shadow-sm bg-white">
            {teamInfo.status === 'pending' ? (
              <p className="text-yellow-600 font-medium">
                Your team is awaiting admin approval. You will see details once approved.
              </p>
            ) : (
              <>
                <p><strong>Team Name:</strong> {teamInfo.teamName}</p>
                <p><strong>Sport:</strong> {teamInfo.sport}</p>
                <p><strong>Members:</strong> {teamInfo.members?.join(', ')}</p>
              </>
            )}

            {!selectedSessionObj?.isActive && (
              <p className="text-gray-500 text-sm mt-2">
                This session is inactive. You cannot make changes.
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default CaptainDashboard;
