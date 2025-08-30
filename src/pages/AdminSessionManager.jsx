import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function AdminSessionManager() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [startMonth, setStartMonth] = useState('Jan');
  const [endMonth, setEndMonth] = useState('July');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true); // page loader
  const [submitLoading, setSubmitLoading] = useState(false);
  const [err, setErr] = useState('');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June',
    'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
  ];
  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await API.get('/session');
      setSessions(res.data);
    } catch (error) {
      setErr('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setErr('');
      await API.post('/session/create', { startMonth, endMonth, year: Number(year) });
      setStartMonth('Jan'); setEndMonth('July'); setYear(new Date().getFullYear());
      fetchSessions();
    } catch (error) {
      setErr('Creation failed. Are you logged in as admin?');
    } finally {
      setSubmitLoading(false);
    }
  };

  const setActive = async (id) => {
    try { await API.put(`/session/set-active/${id}`); fetchSessions(); }
    catch { setErr('Failed to set active'); }
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try { await API.delete(`/session/${id}`); fetchSessions(); }
    catch { setErr('Failed to delete session'); }
  };

  useEffect(() => { fetchSessions(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen bg-gray-50">
      {/* Dashboard Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/admin')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium shadow transition"
        >
          &larr; Dashboard
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Sessions</h2>

      <form onSubmit={createSession} className="bg-white shadow-md p-6 rounded-2xl mb-6">
        <h3 className="font-semibold mb-4">Create New Session</h3>
        {err && <p className="text-red-500 mb-3">{err}</p>}

        <div className="flex gap-2 mb-4">
          {/* Start Month Custom Dropdown */}
          <div className="relative w-1/3">
            <div
              className="w-full border p-3 rounded-lg cursor-pointer flex justify-between items-center"
              onClick={() => setStartOpen(!startOpen)}
            >
              <span>{startMonth}</span>
              <span className="text-gray-500">{startOpen ? '▲' : '▼'}</span>
            </div>
            {startOpen && (
              <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {months.map(m => (
                  <div key={m} className="px-3 py-2 hover:bg-orange-100 cursor-pointer" onClick={() => { setStartMonth(m); setStartOpen(false); }}>{m}</div>
                ))}
              </div>
            )}
          </div>

          {/* End Month Custom Dropdown */}
          <div className="relative w-1/3">
            <div
              className="w-full border p-3 rounded-lg cursor-pointer flex justify-between items-center"
              onClick={() => setEndOpen(!endOpen)}
            >
              <span>{endMonth}</span>
              <span className="text-gray-500">{endOpen ? '▲' : '▼'}</span>
            </div>
            {endOpen && (
              <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {months.map(m => (
                  <div key={m} className="px-3 py-2 hover:bg-orange-100 cursor-pointer" onClick={() => { setEndMonth(m); setEndOpen(false); }}>{m}</div>
                ))}
              </div>
            )}
          </div>

          {/* Year Custom Dropdown */}
          <div className="relative w-1/3">
            <div
              className="w-full border p-3 rounded-lg cursor-pointer flex justify-between items-center"
              onClick={() => setYearOpen(!yearOpen)}
            >
              <span>{year}</span>
              <span className="text-gray-500">{yearOpen ? '▲' : '▼'}</span>
            </div>
            {yearOpen && (
              <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {years.map(y => (
                  <div key={y} className="px-3 py-2 hover:bg-orange-100 cursor-pointer" onClick={() => { setYear(y); setYearOpen(false); }}>{y}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Preview: <strong>{startMonth}–{endMonth} {year}</strong>
        </p>

        <button
          type="submit"
          disabled={submitLoading}
          className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {submitLoading ? 'Creating...' : 'Create Session'}
        </button>
      </form>

      <h3 className="font-semibold mb-2">Existing Sessions</h3>
      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s._id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-orange-50 transition">
            <div>
              <p className="font-medium">
                <strong>{s.session}</strong>{' '}
                {s.isActive && <span className="text-green-600">(Active)</span>}
              </p>
              <p className="text-sm text-gray-500">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              {!s.isActive && <button onClick={() => setActive(s._id)} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Set Active</button>}
              <button onClick={() => deleteSession(s._id)} className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminSessionManager;
