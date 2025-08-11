import React, { useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // default
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setForm({ name: '', email: '', password: '', role: 'student' });

      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating user');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <form onSubmit={handleCreateUser} className="bg-white p-4 shadow rounded space-y-3">
        <h3 className="text-lg font-semibold">Create User Account</h3>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full border p-2"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border p-2"
          value={form.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          className="w-full border p-2"
          value={form.role}
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="captain">Captain</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">
          Create User
        </button>
      </form>

      {/* Navigation Links */}
      <div className="mt-4 space-y-2">
        <Link to="/admin/session" className="text-blue-600 underline block">
          Manage Sessions
        </Link>

        <Link to="/admin/approvals" className="text-blue-600 underline block">
          Approve Teams
        </Link>
      </div>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}

export default AdminDashboard;
