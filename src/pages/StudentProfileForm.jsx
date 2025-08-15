import { useEffect, useState } from 'react';
import API from '../services/api';

const StudentProfileForm = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSessionIsActive, setSelectedSessionIsActive] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    dob: '',
    gender: '',
    contact: '',
    address: '',
    sports: []
  });
  const [adminSports, setAdminSports] = useState([]); // Admin-filled sports
  const [newSport, setNewSport] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await API.get('/student/my-sessions', { withCredentials: true });
      const sessionList = res.data || [];
      setSessions(sessionList);

      if (sessionList.length > 0) {
        const activeSession = sessionList.find(s => s.isActive);
        if (activeSession) {
          setSelectedSession(activeSession._id);
          setSelectedSessionIsActive(true);
        } else {
          setSelectedSession(sessionList[0]._id);
          setSelectedSessionIsActive(sessionList[0].isActive);
        }
      }
    } catch {
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

      // Save admin sports separately
      const adminSportList = data?.sports || [];
      setAdminSports(adminSportList);

      // Merge admin + student-added sports (avoid duplicates)
      setFormData({
        dob: data?.dob ? data.dob.slice(0, 10) : '',
        gender: data?.gender || '',
        contact: data?.contact || '',
        address: data?.address || '',
        sports: Array.from(new Set([...adminSportList])) // initially only admin sports
      });

      const sessionInfo = sessions.find(s => s._id === sessionId);
      setSelectedSessionIsActive(sessionInfo?.isActive || false);
    } catch {
      setErr('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSport = () => {
    if (!newSport.trim()) return;
    const prefixed = newSport.startsWith("PTU Intercollege ")
      ? newSport
      : `PTU Intercollege ${newSport}`;
    if (!formData.sports.includes(prefixed)) {
      setFormData(prev => ({
        ...prev,
        sports: [...prev.sports, prefixed]
      }));
    }
    setNewSport('');
  };

  const handleRemoveSport = (sport) => {
    if (adminSports.includes(sport)) return; // prevent removing admin sports
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.filter(s => s !== sport)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      await API.put('/student/profile', {
        sessionId: selectedSession,
        dob: formData.dob || null,
        gender: formData.gender || '',
        contact: formData.contact || '',
        address: formData.address || '',
        sports: formData.sports
      }, { withCredentials: true });
      alert('✅ Profile saved successfully.');
      fetchProfile(selectedSession);
    } catch {
      setErr('❌ Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (newSport.trim()) {
      const prefixed = newSport.startsWith("PTU Intercollege ")
        ? newSport
        : `PTU Intercollege ${newSport}`;
      if (!formData.sports.includes(prefixed)) {
        setFormData(prev => ({ ...prev, sports: [...prev.sports, prefixed] }));
      }
      setNewSport('');
    }

    setApprovalSubmitting(true);
    setErr('');
    try {
      await API.post('/student/submit-profile', {
        sessionId: selectedSession,
        dob: formData.dob || null,
        gender: formData.gender || '',
        contact: formData.contact || '',
        address: formData.address || '',
        sports: formData.sports
      }, { withCredentials: true });
      alert('✅ Submitted for approval.');
      fetchProfile(selectedSession);
    } catch {
      setErr('❌ Submission failed.');
    } finally {
      setApprovalSubmitting(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { if (selectedSession) fetchProfile(selectedSession); }, [selectedSession]);

  if (loading && !profile) return <p className="text-center">Loading...</p>;

  const isApproved = profile?.isRegistered === true;
  const isSubmitted = profile?.lockedForUpdate === true && !isApproved;
  const readOnly = !selectedSessionIsActive || isApproved || isSubmitted;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Student Profile</h2>

      {err && <p className="text-red-500 mb-2">{err}</p>}

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

      {isSubmitted && <p className="text-yellow-600 font-semibold mb-2">🚧 Pending approval.</p>}
      {isApproved && <p className="text-green-600 font-semibold mb-2">✅ Approved!</p>}
      {!selectedSessionIsActive && <p className="text-blue-600 font-semibold mb-2">ℹ Viewing past session (read-only)</p>}

      {profile && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="w-full border p-2 rounded" disabled={readOnly} />
          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded" disabled={readOnly}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} className="w-full border p-2 rounded" disabled={readOnly} />
          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" disabled={readOnly} />

          <div>
            <label className="block mb-1 font-semibold">Sports</label>
            <div className="flex space-x-2">
              <input type="text" value={newSport} onChange={(e) => setNewSport(e.target.value)} placeholder="Enter sport" className="border p-2 rounded flex-1" disabled={readOnly} />
              <button type="button" onClick={handleAddSport} disabled={readOnly || !newSport.trim()} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[...adminSports, ...formData.sports.filter(s => !adminSports.includes(s))].map((sport, idx) => (
                <span key={idx} className="bg-gray-200 px-3 py-1 rounded-full flex items-center space-x-2">
                  <span>{sport}</span>
                  {!readOnly && !adminSports.includes(sport) && (
                    <button type="button" onClick={() => handleRemoveSport(sport)} className="text-red-500 hover:text-red-700">✕</button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {!readOnly && (
            <div className="flex space-x-3 pt-2">
              <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">{submitting ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={handleSubmitForApproval} disabled={approvalSubmitting} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">{approvalSubmitting ? 'Submitting...' : 'Submit for Approval'}</button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default StudentProfileForm;
