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
        const user = res.data.user;

        // ✅ check activeRole or roles array
        if (user.activeRole === role || (user.roles && user.roles.includes(role))) {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [role]);

  if (loading) return <div>Loading...</div>;
  return authorized ? children : <Navigate to="/" />; // better UX
};

export default ProtectedRoute;
