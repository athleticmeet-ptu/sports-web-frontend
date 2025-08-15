// pages/CreateTeacher.jsx
import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateTeacher() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    employeeId: '',
    specialization: '',
    role: 'teacher'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating teacher');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Teacher</h2>
      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 shadow rounded">
        <input name="name" placeholder="Full Name" className="w-full border p-2" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full border p-2" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="w-full border p-2" onChange={handleChange} required />
        <input name="department" placeholder="Department" className="w-full border p-2" onChange={handleChange} required />
        <input name="employeeId" placeholder="Employee ID" className="w-full border p-2" onChange={handleChange} required />
        <input name="specialization" placeholder="Specialization" className="w-full border p-2" onChange={handleChange} required />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Create Teacher</button>
      </form>
      {message && <p className="mt-3 text-green-600">{message}</p>}
    </div>
  );
}
