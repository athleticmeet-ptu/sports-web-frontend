// pages/CreateCaptain.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateCaptain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Selected captain for viewing/editing
const [selectedCaptain, setSelectedCaptain] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [editForm, setEditForm] = useState({});

// Function to start editing captain
const startEditing = (captain) => {
  setIsEditing(true);
  setEditForm({
    name: captain.name || '',
    branch: captain.branch || '',
    year: captain.year || '',
    urn: captain.urn || '',
    sport: captain.sport || '',
    email: captain.email || '',
    phone: captain.phone || '',
    teamMemberCount: captain.teamMemberCount || '',
  });
  setSelectedCaptain(captain);
};



  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    urn: '',
    year: '',
    sport: '',
    teamMemberCount: '',
    sessionId: '',
    role: 'captain'
  });

  const [sessions, setSessions] = useState([]);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [captains, setCaptains] = useState([]);

  useEffect(() => {
    // simulate loading
    setTimeout(() => setLoading(false), 600);

    API.get('/session/active')
      .then(res => {
        if (res.data?._id) {
          setSessions([res.data]);
          setForm(f => ({ ...f, sessionId: res.data._id }));
        }
      })
      .catch(() => setMessage('⚠ No active session found.'));
    
    // fetch existing captains for display
    API.get('/admin/captains')
      .then(res => setCaptains(res.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setTimeout(() => {
        setShowModal(false);
        setSubmitLoading(false);
        // optionally refresh captain list
        API.get('/admin/users?role=captain')
          .then(res => setCaptains(res.data || []))
          .catch(() => {});
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating captain');
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
      {/* Dashboard Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/admin')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium shadow transition"
        >
          &larr; Dashboard
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Captains</h2>

      {/* Create Captain Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-lg font-semibold shadow-lg hover:scale-[1.02] transition transform"
      >
        + Create Captain
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
              Create Captain
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
                name="branch"
                placeholder="Branch"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.branch}
                onChange={handleChange}
                required
              />
              <input
                name="urn"
                placeholder="URN"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.urn}
                onChange={handleChange}
                required
              />
              <input
                name="year"
                type="number"
                placeholder="Year"
               className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.year}
                onChange={handleChange}
                required
              />
              <input
                name="sport"
                placeholder="Sport"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.sport}
                onChange={handleChange}
                required
              />
              <input
                name="teamMemberCount"
                type="number"
                placeholder="Team Member Count"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={form.teamMemberCount}
                onChange={handleChange}
                required
              />

              {/* Custom Session Dropdown */}
              <div className="relative">
                <div
                  className="w-full border p-3 rounded-lg cursor-pointer flex justify-between items-center"
                  onClick={() => setSessionOpen(!sessionOpen)}
                >
                  <span>{sessions.find(s => s._id === form.sessionId)?.session || '-- Select Session --'}</span>
                  <span className="text-gray-500">{sessionOpen ? '▲' : '▼'}</span>
                </div>
                {sessionOpen && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {sessions.map(s => (
                      <div
                        key={s._id}
                        className="px-3 py-2 hover:bg-orange-100 cursor-pointer"
                        onClick={() => { setForm({ ...form, sessionId: s._id }); setSessionOpen(false); }}
                      >
                        {s.session}
                      </div>
                    ))}
                  </div>
                )}
              </div>

             <button
                type="submit"
                disabled={submitLoading}
                className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02] ${
                  submitLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitLoading ? 'Creating...' : 'Create Captain'}
              </button>
            </form>
          </div>
        </div>
      )}

     {/* Captains List Block */}
<div className="mt-8 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
  <h3 className="text-lg font-semibold mb-4">All Captains</h3>

  {captains.length === 0 ? (
    <p className="text-gray-500">Captain data will appear here after API integration.</p>
  ) : (
    <ul className="space-y-2">
      {captains.map((c) => (
        <li
          key={c._id}
          className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-orange-50"
        >
          {/* Captain Info */}
          <div className="mb-2 md:mb-0">
            <p><b>Name:</b> {c.name}</p>
            <p><b>Sport:</b> {c.sport}</p>
            <p><b>Branch:</b> {c.branch}</p>
            <p><b>Year:</b> {c.year}</p>
            <p><b>URN:</b> {c.urn}</p>
            <p><b>Email:</b> {c.email || "N/A"}</p>
            <p><b>Phone:</b> {c.phone || "N/A"}</p>
            <p><b>Team Members:</b> {c.teamMembers?.length || 0}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-2">
            <button
              onClick={() => setSelectedCaptain(c)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              View Team Members
            </button>
            <button
              onClick={() => startEditing(c)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              Edit Captain
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

{/* Popup Modal for View/Edit */}
{selectedCaptain && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
      <button
        onClick={() => setSelectedCaptain(null)}
        className="absolute top-2 right-2 text-gray-600 text-lg font-bold"
      >
        ✕
      </button>

      {/* Editing Modal */}
      {isEditing ? (
        <>
          <h3 className="text-xl font-bold mb-4">Edit Captain</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(editForm).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium capitalize">{field}</label>
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={editForm[field]}
                  onChange={(e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })}
                  className="border rounded p-2 w-full"
                  required={field !== "phone" && field !== "email"} 
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await API.put(`/admin/captains/${selectedCaptain._id}`, editForm);
                  setCaptains(
                    captains.map(c => c._id === res.data._id ? res.data : c)
                  );
                  setSelectedCaptain(res.data);
                  setIsEditing(false);
                } catch (err) {
                  alert("Failed to update captain");
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold mb-4">Captain Details</h3>
          <p><b>Name:</b> {selectedCaptain.name}</p>
          <p><b>Sport:</b> {selectedCaptain.sport}</p>
          <p><b>Branch:</b> {selectedCaptain.branch}</p>
          <p><b>Year:</b> {selectedCaptain.year}</p>
          <p><b>URN:</b> {selectedCaptain.urn}</p>
          <p><b>Email:</b> {selectedCaptain.email || "N/A"}</p>
          <p><b>Phone:</b> {selectedCaptain.phone || "N/A"}</p>

          <h4 className="mt-4 font-semibold">Team Members</h4>
          {selectedCaptain.teamMembers?.length > 0 ? (
            <ul className="list-disc list-inside ml-4">
              {selectedCaptain.teamMembers.map((m, idx) => (
                <li key={idx}>
                  {m.name} ({m.branch}, Year {m.year}) – URN: {m.urn}, Email: {m.email || "N/A"}, Phone: {m.phone || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No team members added.</p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setSelectedCaptain(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
            <button
              onClick={() => startEditing(selectedCaptain)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Edit Captain
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

  );
}
