// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';

function StudentDashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await API.get('/student/profile'); // Protected route
      setProfile(res.data);
    };
    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Student Dashboard</h1>
      {profile ? (
        <div className="space-y-2">
          <p><strong>Name:</strong> {profile.userId.name}</p>
          <p><strong>Student ID:</strong> {profile.studentId}</p>
          <p><strong>Session:</strong> {profile.session}</p>
          <p><strong>Semester:</strong> {profile.semester}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default StudentDashboard;
