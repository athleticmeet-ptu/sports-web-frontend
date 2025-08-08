import { useEffect, useState } from 'react';
import API from '../services/api';

const AdminApprovalDashboard = () => {
  const [pendingProfiles, setPendingProfiles] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      const res = await API.get('/admin/pending-profiles', { withCredentials: true });
      setPendingProfiles(res.data);
    };
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    await API.post(`/admin/approve/${id}`, {}, { withCredentials: true });
    setPendingProfiles(pendingProfiles.filter(p => p._id !== id));
    alert('Approved!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Student Registrations</h1>
      {pendingProfiles.length === 0 ? (
        <p>No pending profiles.</p>
      ) : (
        <table className="table-auto w-full bg-white shadow rounded">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Session</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingProfiles.map(profile => (
              <tr key={profile._id}>
                <td>{profile.userId?.name}</td>
                <td>{profile.userId?.email}</td>
                <td>{profile.session} - {profile.semester}</td>
                <td>
                  <button className="btn btn-success" onClick={() => handleApprove(profile._id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminApprovalDashboard;
