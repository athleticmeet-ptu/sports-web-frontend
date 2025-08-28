// pages/CreateStudent.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    course: '',
    year: '',
    sessionId: '',
    sports: [],
    role: 'student'
  });

  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState('');
  const [courseOpen, setCourseOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const courses = ['B.Tech CSE', 'B.Tech IT', 'MBA']; // future add more
  const years = Array.from({length: 10}, (_, i) => 2020 + i);

  useEffect(() => {
    API.get('/session/active')
      .then(res => {
        if (res.data?._id) {
          setSessions([res.data]);
          setForm(f => ({ ...f, sessionId: res.data._id }));
        }
      })
      .catch(() => {
        setMessage('⚠ No active session found. Please create one first.');
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 800);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // URN: only numbers
    if (name === 'rollNumber' && !/^\d*$/.test(value)) return;

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setTimeout(() => navigate('/admin'), 1200); // redirect to dashboard
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating student');
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Home Link */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded shadow transition"
        >
          &larr; Dashboard
        </Link>
      </div>

      {/* Form Container */}
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Student
        </h2>

        {message && (
          <p className="text-red-600 text-center mb-4 font-medium">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <input
            name="name"
            placeholder="Full Name"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none pr-10"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="absolute right-3 top-3 cursor-pointer select-none text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          <input
            name="rollNumber"
            placeholder="URN"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
            value={form.rollNumber}
            onChange={handleChange}
            required
          />

          {/* Course Dropdown */}
          <div className="relative">
            <div
              className="w-full border p-3 rounded-lg cursor-pointer focus:ring-2 focus:ring-orange-400 focus:outline-none flex justify-between items-center"
              onClick={() => setCourseOpen(!courseOpen)}
            >
              <span>{form.course || '-- Select Course / Branch --'}</span>
              <span className="text-gray-500">{courseOpen ? '▲' : '▼'}</span>
            </div>
            {courseOpen && (
              <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {courses.map(c => (
                  <div
                    key={c}
                    className="px-3 py-2 hover:bg-orange-100 cursor-pointer"
                    onClick={() => { setForm({ ...form, course: c }); setCourseOpen(false); }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <div
              className="w-full border p-3 rounded-lg cursor-pointer focus:ring-2 focus:ring-orange-400 focus:outline-none flex justify-between items-center"
              onClick={() => setYearOpen(!yearOpen)}
            >
              <span>{form.year || '-- Select Year --'}</span>
              <span className="text-gray-500">{yearOpen ? '▲' : '▼'}</span>
            </div>
            {yearOpen && (
              <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                {years.map(y => (
                  <div
                    key={y}
                    className="px-3 py-2 hover:bg-orange-100 cursor-pointer"
                    onClick={() => { setForm({ ...form, year: y }); setYearOpen(false); }}
                  >
                    {y}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session Dropdown */}
          <select
            name="sessionId"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
            value={form.sessionId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Session --</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.session}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitLoading}
            className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] ${
              submitLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitLoading ? 'Creating...' : 'Create Student'}
          </button>
        </form>
      </div>
    </div>
  );
}
