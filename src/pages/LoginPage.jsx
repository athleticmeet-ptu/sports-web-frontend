// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post('/auth/login', { email, password });

    const { role } = res.data.user;

    // ✅ Wait 200ms to let browser store the cookie
    setTimeout(() => {
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
    }, 200); // You can adjust this if needed
  } catch (error) {
    setErr(error.response?.data?.message || 'Login failed');
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="w-full max-w-sm p-6 bg-white shadow-md rounded">
        <h2 className="text-xl mb-4 text-center font-semibold">Login</h2>
        {err && <p className="text-red-500 mb-2">{err}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="w-full p-2 mb-3 border"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="w-full p-2 mb-4 border"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
