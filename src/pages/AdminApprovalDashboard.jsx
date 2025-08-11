import { useEffect, useState } from 'react';
import API from '../services/api';

const AdminApprovalDashboard = () => {
  const [pendingTeams, setPendingTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch pending teams from server
  const fetchPendingTeams = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await API.get('/admin/pending-teams', { withCredentials: true });
      setPendingTeams(res.data || []);
    } catch (err) {
      console.error('Failed to load pending teams', err);
      setError('Failed to load pending teams.');
    } finally {
      setLoading(false);
    }
  };

  // Approve team
const handleApprove = async (teamId) => {
  try {
    await API.put(
      `/admin/team/${teamId}/status`, // match this route
      { status: 'approved' },          // send status in body
      { withCredentials: true }
    );
    setPendingTeams((prev) => prev.filter(team => team._id !== teamId));
    alert('✅ Team approved successfully!');
  } catch (err) {
    console.error('Error approving team', err);
    alert('❌ Failed to approve team.');
  }
};

  useEffect(() => {
    fetchPendingTeams();
  }, []);

  if (loading) {
    return <p className="p-6">Loading pending teams...</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Team Approvals</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {pendingTeams.length === 0 ? (
        <p className="text-gray-500">No pending teams for approval.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow rounded border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Team Name</th>
                <th className="p-2 border">Sport</th>
                <th className="p-2 border">Members</th>
                <th className="p-2 border">Captain</th>
                <th className="p-2 border">Session</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTeams.map((team) => (
                <tr key={team._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{team.teamName}</td>
                  <td className="p-2 border">{team.sport}</td>
                  <td className="p-2 border">
                    {team.members?.join(', ') || 'No members listed'}
                  </td>
                  <td className="p-2 border">{team.captainId?.name || 'Unknown'}</td>
                  <td className="p-2 border">{team.sessionId?.session || 'N/A'}</td>
                  <td className="p-2 border text-center">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => handleApprove(team._id)}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalDashboard;
