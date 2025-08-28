import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating student');
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
          to="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded shadow transition"
        >
          &larr; Home
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <select
            name="course"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Course / Branch --</option>
            <option value="B.Tech CSE">B.Tech CSE</option>
            <option value="B.Tech IT">B.Tech IT</option>
            <option value="MBA">MBA</option>
            {/* add more later */}
          </select>

          {/* Year picker */}
        <select
  name="year"
  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
  value={form.year}
  onChange={handleChange}
  required
>
  <option value="">-- Select Year --</option>
  {Array.from({length: 10}, (_, i) => {
    const y = 2020 + i; // example 2020-2029
    return <option key={y} value={y}>{y}</option>
  })}
</select>


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
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 shadow-lg transition transform hover:scale-[1.02]"
          >
            Create Student
          </button>
        </form>
      </div>
    </div>
  );
}
