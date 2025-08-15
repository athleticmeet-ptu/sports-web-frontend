// src/pages/CaptainDashboard.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';

function CaptainDashboard() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [captainInfo, setCaptainInfo] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [step, setStep] = useState(''); // 'profile', 'team', 'done'
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
      }
    } catch {
      setErr('Failed to load sessions.');
    }
  };

  const fetchCaptainInfo = async (sessionId) => {
    try {
      const res = await API.get(`/captain/profile?sessionId=${sessionId}`);
      return res.data?.data || null;
    } catch {
      setErr('Failed to load captain info.');
      return null;
    }
  };

  const fetchTeamInfo = async (sessionId) => {
    try {
      const res = await API.get(`/captain/my-team?sessionId=${sessionId}`);
      return res.data || null;
    } catch {
      setErr('Failed to load team info.');
      return null;
    }
  };

  const decideStep = (captain, team) => {
    if (!captain?.phone) {
      setStep('profile');
    } else if (!team?.teamExists || (team.members?.length < captain.teamMemberCount)) {
      setStep('team');
    } else {
      setStep('done');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchSessions();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedSession) {
        setLoading(true);
        const captain = await fetchCaptainInfo(selectedSession);
        const team = await fetchTeamInfo(selectedSession);
        setCaptainInfo(captain);
        setTeamInfo(team);
        decideStep(captain, team);
        setLoading(false);
      }
    })();
  }, [selectedSession]);

  const handleCaptainSubmit = async (e) => {
    e.preventDefault();
    try {
      setErr('');
      await API.post('/captain/profile', {
        phone: e.target.phone.value,
        sessionId: selectedSession,
      });
      const captain = await fetchCaptainInfo(selectedSession);
      setCaptainInfo(captain);
      decideStep(captain, teamInfo);
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to save profile.');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const form = e.target;
      const member = {
        name: form.name.value,
        branch: form.branch.value,
        urn: form.urn.value,
        year: Number(form.year.value),
        email: form.email.value,
        phone: form.phone.value,
        sport: captainInfo.sport,
      };

      await API.post('/captain/my-team/member', {
        sessionId: selectedSession,
         member: member
      });

      // Refresh team info after adding member
      const updatedTeam = await fetchTeamInfo(selectedSession);
      setTeamInfo(updatedTeam);

      // Reset form for next member
      form.reset();

      // Check if all members added
      if (updatedTeam.members.length >= captainInfo.teamMemberCount) {
        setStep('done');
      }
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to add team member.');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

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

      {/* Profile Step */}
      {step === 'profile' && captainInfo && (
        <form onSubmit={handleCaptainSubmit} className="space-y-3 bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold mb-3">Complete Your Profile</h3>
          <input value={captainInfo.name} disabled className="w-full border p-2 bg-gray-100" />
          <input value={captainInfo.branch} disabled className="w-full border p-2 bg-gray-100" />
          <input value={captainInfo.urn} disabled className="w-full border p-2 bg-gray-100" />
          <input value={captainInfo.year} disabled className="w-full border p-2 bg-gray-100" />
          <input value={captainInfo.sport} disabled className="w-full border p-2 bg-gray-100" />
          <input value={captainInfo.teamMemberCount} disabled className="w-full border p-2 bg-gray-100" />
          <input value={captainInfo.email} disabled className="w-full border p-2 bg-gray-100" />
          <input name="phone" placeholder="Phone" className="w-full border p-2" required />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </form>
      )}

      {/* Team Step */}
      {step === 'team' && captainInfo && (
        <div className="space-y-6 bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold mb-3">Add Team Members</h3>

          {/* List of already added members */}
          {teamInfo?.members?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Added Members:</h4>
              <table className="table-auto border-collapse border border-gray-300 w-full text-left">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1">#</th>
                    <th className="border border-gray-300 px-2 py-1">Name</th>
                    <th className="border border-gray-300 px-2 py-1">Branch</th>
                    <th className="border border-gray-300 px-2 py-1">URN</th>
                    <th className="border border-gray-300 px-2 py-1">Year</th>
                    <th className="border border-gray-300 px-2 py-1">Email</th>
                    <th className="border border-gray-300 px-2 py-1">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {teamInfo.members.map((m, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-2 py-1">{i + 1}</td>
                      <td className="border border-gray-300 px-2 py-1">{m.name}</td>
                      <td className="border border-gray-300 px-2 py-1">{m.branch}</td>
                      <td className="border border-gray-300 px-2 py-1">{m.urn}</td>
                      <td className="border border-gray-300 px-2 py-1">{m.year}</td>
                      <td className="border border-gray-300 px-2 py-1">{m.email}</td>
                      <td className="border border-gray-300 px-2 py-1">{m.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Form for next member */}
          {teamInfo.members.length < captainInfo.teamMemberCount && (
            <form onSubmit={handleAddMember} className="space-y-3 border p-4 rounded">
              <h4 className="font-semibold mb-3">
                Enter Details for Member {teamInfo.members.length + 1} of {captainInfo.teamMemberCount}
              </h4>
              <input name="name" placeholder="Full Name" className="w-full border p-2" required />
              <input name="branch" placeholder="Branch" className="w-full border p-2" required />
              <input name="urn" placeholder="URN" className="w-full border p-2" required />
              <input name="year" placeholder="Year" type="number" min="1" className="w-full border p-2" required />
              <input name="email" placeholder="Email" type="email" className="w-full border p-2" required />
              <input name="phone" placeholder="Phone" className="w-full border p-2" required />
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Member</button>
            </form>
          )}
        </div>
      )}

{/* Done Step */}
{step === 'done' && teamInfo && (
  <div className="border p-4 rounded shadow-sm bg-white">
    <h3 className="text-lg font-semibold mb-3">Team Submitted</h3>
    <p><strong>Sport:</strong> {captainInfo.sport}</p>
    <p><strong>Status:</strong> 
      <span
        className={
          teamInfo.status === 'approved' ? 'text-green-600 font-bold' :
          teamInfo.status === 'rejected' ? 'text-red-600 font-bold' :
          'text-yellow-600 font-bold'
        }
      >
        {teamInfo.status ? teamInfo.status.toUpperCase() : 'PENDING'}
      </span>
    </p>
    <p><strong>Members:</strong></p>
    <table className="table-auto border-collapse border border-gray-300 w-full text-left">
      <thead>
        <tr>
          <th className="border border-gray-300 px-2 py-1">#</th>
          <th className="border border-gray-300 px-2 py-1">Name</th>
          <th className="border border-gray-300 px-2 py-1">Branch</th>
          <th className="border border-gray-300 px-2 py-1">URN</th>
          <th className="border border-gray-300 px-2 py-1">Year</th>
          <th className="border border-gray-300 px-2 py-1">Email</th>
          <th className="border border-gray-300 px-2 py-1">Phone</th>
        </tr>
      </thead>
      <tbody>
        {teamInfo.members.map((m, i) => (
          <tr key={i}>
            <td className="border border-gray-300 px-2 py-1">{i + 1}</td>
            <td className="border border-gray-300 px-2 py-1">{m.name}</td>
            <td className="border border-gray-300 px-2 py-1">{m.branch}</td>
            <td className="border border-gray-300 px-2 py-1">{m.urn}</td>
            <td className="border border-gray-300 px-2 py-1">{m.year}</td>
            <td className="border border-gray-300 px-2 py-1">{m.email}</td>
            <td className="border border-gray-300 px-2 py-1">{m.phone}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="mt-4 font-semibold">
      {teamInfo.status === 'approved'
        ? 'Your team has been approved. Congratulations!'
        : teamInfo.status === 'rejected'
          ? 'Your team was rejected. Please contact admin.'
          : 'All team members added. Waiting for approval.'}
    </p>
  </div>
)}

    </div>
  );
}

export default CaptainDashboard;
