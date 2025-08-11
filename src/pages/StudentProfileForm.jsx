// src/pages/StudentProfileForm.jsx
import { useEffect, useState } from 'react';
import API from '../services/api';

const StudentProfileForm = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    dob: '',
    gender: '',
    contact: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await API.get('/sessions');
      setSessions(res.data || []);
      const active = res.data?.find(s => s.isActive);
      if (active) setSelectedSession(active._id);
    } catch (err) {
      setErr('Failed to load sessions.');
    }
  };

  const fetchProfile = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setErr('');
    try {
      const res = await API.get(`/student/profile?sessionId=${sessionId}`, { withCredentials: true });
      const data = res.data;
      setProfile(data);

      if (data?.personalDetails) {
        setFormData({
          dob: data.personalDetails.dob?.slice(0, 10) || '',
          gender: data.personalDetails.gender || '',
          contact: data.personalDetails.contact || '',
          address: data.personalDetails.address || '',
        });
      }
    } catch {
      setErr('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const payload = {
        personalDetails: { ...formData },
        sessionId: selectedSession,
      };
      await API.put('/student/profile', payload, { withCredentials: true });
      alert('✅ Profile saved successfully.');
      fetchProfile(selectedSession);
    } catch {
      setErr('❌ Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setApprovalSubmitting(true);
    setErr('');
    try {
      await API.post('/student/submit-profile', { sessionId: selectedSession }, { withCredentials: true });
      alert('✅ Submitted for approval.');
      fetchProfile(selectedSession);
    } catch {
      setErr('❌ Submission failed.');
    } finally {
      setApprovalSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) fetchProfile(selectedSession);
  }, [selectedSession]);

  if (loading && !profile) return <p className="text-center">Loading...</p>;

  const isSubmitted = profile?.lockedForUpdate || profile?.pendingUpdateRequest;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Student Profile</h2>
      {err && <p className="text-red-500 mb-2">{err}</p>}

      {/* Session selector */}
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

      {isSubmitted && (
        <p className="text-yellow-600 font-semibold mb-2">
          🚧 Your profile has been submitted and is pending approval.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="w-full border p-2 rounded" required disabled={isSubmitted} />
        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded" required disabled={isSubmitted}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} className="w-full border p-2 rounded" required disabled={isSubmitted} />
        <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" required disabled={isSubmitted} />

        {!isSubmitted && (
          <div className="flex space-x-3 pt-2">
            <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={handleSubmitForApproval} disabled={approvalSubmitting} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
              {approvalSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default StudentProfileForm;
