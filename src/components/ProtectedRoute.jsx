// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../services/api';

const ProtectedRoute = ({ children, role }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get('/auth/me', { withCredentials: true });
        if (res.data.user.role === role) {
          setAuthorized(true);
        }
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [role]);

  if (loading) return <div>Loading...</div>;
  return authorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
