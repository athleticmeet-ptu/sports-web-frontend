// src/pages/CaptainDashboard.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';

function CaptainDashboard() {
  const [teamInfo, setTeamInfo] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Fetch active session from backend
  const fetchActiveSession = async () => {
    try {
      const res = await API.get('/session/active');
      setActiveSession(res.data);
      return res.data;
    } catch {
      setErr('Failed to load active session');
      return null;
    }
  };

  // Fetch current captain's team (no sessionId needed in URL)
  const fetchTeamInfo = async () => {
    try {
      const res = await API.get(`/captain/my-team`);
      if (!res.data) {
        setIsFirstTime(true);
        setTeamInfo(null);
      } else {
        setIsFirstTime(false);
        setTeamInfo(res.data);
      }
    } catch {
      setErr('Failed to load team info');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for first-time team creation
  const handleFirstTimeSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        teamName: e.target.teamName.value,
        sport: e.target.sport.value,
        members: e.target.members.value.split(',').map((m) => m.trim()),
      };
      await API.post('/captain/my-team', formData);
      fetchTeamInfo();
    } catch {
      setErr('Failed to save team');
    }
  };

  // Initial data loading
  useEffect(() => {
    (async () => {
      const session = await fetchActiveSession();
      if (session?._id) {
        fetchTeamInfo();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  // Loading state
  if (loading) return <p className="p-6">Loading...</p>;

  // No active session
  if (!activeSession) {
    return (
      <p className="p-6 text-red-500">
        No active session found. Please contact admin.
      </p>
    );
  }

  // First-time team creation form
  if (isFirstTime) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">
          Create Your Team for {activeSession.session}
        </h2>
        {err && <p className="text-red-500 mb-2">{err}</p>}
        <form onSubmit={handleFirstTimeSubmit} className="space-y-3">
          <input
            name="teamName"
            placeholder="Team Name"
            className="w-full border p-2"
            required
          />
          <input
            name="sport"
            placeholder="Sport"
            className="w-full border p-2"
            required
          />
          <textarea
            name="members"
            placeholder="Comma separated member names"
            className="w-full border p-2"
            required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      </div>
    );
  }

  // Show team info if it exists
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        My Team for {activeSession.session}
      </h2>
      {err && <p className="text-red-500 mb-2">{err}</p>}
      <div className="border p-4 rounded shadow-sm bg-white">
        <p>
          <strong>Team Name:</strong> {teamInfo?.teamName}
        </p>
        <p>
          <strong>Sport:</strong> {teamInfo?.sport}
        </p>
        <p>
          <strong>Members:</strong> {teamInfo?.members?.join(', ')}
        </p>
      </div>
    </div>
  );
}

export default CaptainDashboard;
