// pages/Students.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Students() {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    course: '',
    year: '',
    sessionId: '',
    sports: [],
    role: 'student',
  });

  const [students, setStudents] = useState([]); // future API data
  const [sessions, setSessions] = useState([]);

  const courses = ['B.Tech CSE', 'B.Tech IT', 'MBA'];
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);

    // fetch active session
    API.get('/session/active')
      .then(res => {
        if (res.data?._id) {
          setSessions([res.data]);
          setForm(f => ({ ...f, sessionId: res.data._id }));
        }
      })
      .catch(() => setMessage('⚠ No active session found.'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rollNumber' && !/^\d*$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setTimeout(() => {
        setShowModal(false);
        setSubmitLoading(false);
      }, 1200);
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Students</h2>

      {/* Create Student Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-lg font-semibold shadow-lg hover:scale-[1.02] transition transform"
      >
        + Create Student
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Create Student
            </h2>

            {message && (
              <p className="text-red-600 text-center mb-4 font-medium">{message}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 relative">
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
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.password}
                onChange={handleChange}
                required
              />
              <input
                name="rollNumber"
                placeholder="URN"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.rollNumber}
                onChange={handleChange}
                required
              />

              {/* Course */}
              <select
                name="course"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.course}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Year */}
              <select
                name="year"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.year}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Year --</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Session */}
              <select
                name="sessionId"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.sessionId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Session --</option>
                {sessions.map(s => <option key={s._id} value={s._id}>{s.session}</option>)}
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
      )}

      {/* Students List Block */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">All Students</h3>
        <p className="text-gray-500">Student data will appear here after API integration.</p>
      </div>
    </div>
  );
}
