// pages/CreateStudent.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    course: '',
    year: '',
    sessionId: '',
    sports: [], // empty by default
    role: 'student' // fixed
  });
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch active session
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
      });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Student</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-white p-4 shadow rounded"
      >
        <input name="name" placeholder="Full Name" className="w-full border p-2"
          value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full border p-2"
          value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="w-full border p-2"
          value={form.password} onChange={handleChange} required />
        <input name="rollNumber" placeholder="URN" className="w-full border p-2"
          value={form.rollNumber} onChange={handleChange} required />
        <input name="course" placeholder="Course" className="w-full border p-2"
          value={form.course} onChange={handleChange} required />
        <input name="year" placeholder="Degree Year" className="w-full border p-2"
          value={form.year} onChange={handleChange} required />

        {/* Session Dropdown */}
        <select
          name="sessionId"
          className="w-full border p-2"
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

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Student
        </button>
      </form>
      {message && <p className="mt-3 text-red-600">{message}</p>}
    </div>
  );
}
