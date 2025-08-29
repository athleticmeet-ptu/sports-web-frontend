import React, { useEffect, useState } from 'react';
import API from '../services/api';

function AdminSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [startMonth, setStartMonth] = useState('Jan');
  const [endMonth, setEndMonth] = useState('July');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
    'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
  ];

  // year list banayenge (current year -10 se +10 tak)
  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

  const fetchSessions = async () => {
    try {
      const res = await API.get('/session');
      setSessions(res.data);
    } catch (error) {
      setErr('Failed to load sessions');
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr('');

      await API.post('/session/create', {
        startMonth,
        endMonth,
        year: Number(year)
      });

      setStartMonth('Jan');
      setEndMonth('July');
      setYear(new Date().getFullYear());
      fetchSessions();
    } catch (error) {
      setErr('Creation failed. Are you logged in as admin?');
    } finally {
      setLoading(false);
    }
  };

  const setActive = async (id) => {
    try {
      await API.put(`/session/set-active/${id}`);
      fetchSessions();
    } catch {
      setErr('Failed to set active');
    }
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await API.delete(`/session/${id}`);
      fetchSessions();
    } catch {
      setErr('Failed to delete session');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Sessions</h2>

      <form onSubmit={createSession} className="bg-white shadow-md p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Create New Session</h3>
        {err && <p className="text-red-500">{err}</p>}
        <div className="flex gap-2 mb-2">
          {/* Start Month Picker */}
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="p-2 border w-full"
            required
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* End Month Picker */}
          <select
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className="p-2 border w-full"
            required
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Year Picker */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 border w-full"
            required
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <p className="text-sm text-gray-600 mb-2">
          Preview: <strong>{startMonth}–{endMonth} {year}</strong>
        </p>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      <h3 className="font-semibold mb-2">Existing Sessions</h3>
      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s._id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p>
                <strong>{s.session}</strong>{' '}
                {s.isActive && <span className="text-green-600">(Active)</span>}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {!s.isActive && (
                <button
                  onClick={() => setActive(s._id)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded"
                >
                  Set Active
                </button>
              )}
              <button
                onClick={() => deleteSession(s._id)}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminSessionManager;
