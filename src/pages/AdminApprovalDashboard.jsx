import { useEffect, useState } from 'react';
import API from '../services/api';

const AdminApprovalDashboard = () => {
  const [pendingTeams, setPendingTeams] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch both pending teams and student profiles
  const fetchPendingData = async () => {
    try {
      setError('');
      setLoading(true);

      const [teamsRes, studentsRes] = await Promise.all([
        API.get('/admin/pending-teams', { withCredentials: true }),
        API.get('/admin/pending-profiles', { withCredentials: true })
      ]);

      setPendingTeams(teamsRes.data || []);
      setPendingStudents(studentsRes.data || []);
    } catch (err) {
      console.error('Failed to load pending approvals', err);
      setError('Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  // Update team status
  const updateTeamStatus = async (teamId, status) => {
    try {
      await API.put(
        `/admin/team/${teamId}/status`,
        { status },
        { withCredentials: true }
      );
      setPendingTeams(prev => prev.filter(team => team._id !== teamId));
      alert(`✅ Team ${status} successfully!`);
    } catch (err) {
      console.error(`Error updating team status to ${status}`, err);
      alert(`❌ Failed to ${status} team.`);
    }
  };

  // Approve/reject student
  const updateStudentStatus = async (studentId, status) => {
    try {
      if (status === 'approved') {
        await API.put(`/admin/student/${studentId}/approve`, {}, { withCredentials: true });
      } else {
        await API.delete(`/admin/student/${studentId}/reject`, { withCredentials: true });
      }
      setPendingStudents(prev => prev.filter(s => s._id !== studentId));
      alert(`✅ Student ${status} successfully!`);
    } catch (err) {
      console.error(`Error updating student status to ${status}`, err);
      alert(`❌ Failed to ${status} student.`);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  if (loading) {
    return <p className="p-6">Loading pending approvals...</p>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Approvals</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Pending Students */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Pending Student Profiles</h2>
        {pendingStudents.length === 0 ? (
          <p className="text-gray-500">No pending student profiles.</p>
        ) : (
          <div className="space-y-4">
            {pendingStudents.map(student => (
              <div key={student._id} className="border rounded shadow p-4 bg-white">
                <div className="flex justify-between">
                  <div>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>URN:</strong> {student.urn}</p>
                    <p><strong>Branch:</strong> {student.branch}</p>
                    <p><strong>Year:</strong> {student.year}</p>
                    <p>
  <strong>Sports:</strong>{' '}
  {student.sports?.length > 0 ? student.sports.join(', ') : 'N/A'}
</p>

                    <p><strong>Session:</strong> {student.session?.session || 'N/A'}</p>
                    <p><strong>Email:</strong> {student.email || 'N/A'}</p>
                      <p><strong>DOB:</strong> {student.dob
    ? new Date(student.dob).toLocaleDateString()
    : 'N/A'}</p>
  <p><strong>Gender:</strong> {student.gender || 'N/A'}</p>
  <p><strong>Address:</strong> {student.address || 'N/A'}</p>
  <p><strong>Phone:</strong> {student.phone || 'N/A'}</p>

                  </div>
                  <div className="space-x-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => updateStudentStatus(student._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => updateStudentStatus(student._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Teams */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Pending Teams</h2>
        {pendingTeams.length === 0 ? (
          <p className="text-gray-500">No pending teams for approval.</p>
        ) : (
          <div className="overflow-x-auto">
            {pendingTeams.map(team => (
              <div key={team._id} className="mb-6 border rounded shadow p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h2 className="text-lg font-semibold">{team.teamName}</h2>
                    <p><strong>Sport:</strong> {team.sport}</p>
                    <p><strong>Captain:</strong> {team.captainId?.name || 'Unknown'}</p>
                    <p><strong>Session:</strong> {team.sessionId?.session || 'N/A'}</p>
                    <p><strong>Status:</strong> {team.status.toUpperCase()||''}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => updateTeamStatus(team._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => updateTeamStatus(team._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Members Table */}
                {team.members?.length > 0 ? (
                  <table className="table-auto w-full border-collapse border border-gray-300 mt-2">
                    <thead className="bg-gray-100">
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
                      {team.members.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50">
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
                ) : (
                  <p className="text-gray-500 mt-2">No members listed</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminApprovalDashboard;
