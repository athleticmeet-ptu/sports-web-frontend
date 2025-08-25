// frontend/src/pages/CaptainsAndTeams.jsx
import React, { useEffect, useState } from "react";

function CaptainsAndTeams() {
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchCaptains = async () => {
      try {
        const res = await fetch("/api/admin/captains");
        const data = await res.json();

        if (Array.isArray(data)) {
          setCaptains(data);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        setError("Failed to fetch captains");
      } finally {
        setLoading(false);
      }
    };

    fetchCaptains();
  }, []);

  const handleDeleteCaptain = async (id) => {
    if (!window.confirm("Are you sure you want to delete this captain?")) return;
    try {
      await fetch(`/api/admin/captains/${id}`, { method: "DELETE" });
      setCaptains(captains.filter((c) => c._id !== id));
      setSelectedCaptain(null);
    } catch (err) {
      alert("Error deleting captain");
    }
  };

  const handleDeleteMember = async (captainId, memberIndex) => {
    if (!window.confirm("Delete this team member?")) return;
    try {
      await fetch(`/api/admin/captains/${captainId}/members/${memberIndex}`, {
        method: "DELETE",
      });
      setSelectedCaptain({
        ...selectedCaptain,
        teamMembers: selectedCaptain.teamMembers.filter(
          (_, i) => i !== memberIndex
        ),
      });
    } catch (err) {
      alert("Error deleting team member");
    }
  };

  const startEditing = (captain) => {
    setIsEditing(true);
    setEditForm({
      name: captain.name || "",
      branch: captain.branch || "",
      year: captain.year || "",
      urn: captain.urn || "",
      sport: captain.sport || "",
      email: captain.email || "",
      phone: captain.phone || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/admin/captains/${selectedCaptain._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update captain");

      const updatedCaptain = await res.json();

      // update state
      setCaptains(
        captains.map((c) => (c._id === updatedCaptain._id ? updatedCaptain : c))
      );
      setSelectedCaptain(updatedCaptain);
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center mt-6">Loading captains...</p>;
  if (error) return <p className="text-center text-red-500 mt-6">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Captains & Teams</h2>

      {captains.length === 0 ? (
        <p className="text-gray-500">No captains found.</p>
      ) : (
        captains.map((captain) => (
          <div
            key={captain._id}
            className="border rounded-lg shadow p-4 mb-6 bg-white"
          >
            <h3 className="text-lg font-semibold">
              Captain: {captain.name} ({captain.branch}, {captain.year} Year)
            </h3>
            <p>URN: {captain.urn}</p>
            <p>Sport: {captain.sport}</p>

            <button
              onClick={() => {
                setSelectedCaptain(captain);
                setIsEditing(false);
              }}
              className="text-blue-600 underline mt-2 inline-block"
            >
              View Full Details
            </button>
          </div>
        ))
      )}

      {/* Popup Modal */}
      {selectedCaptain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={() => setSelectedCaptain(null)}
              className="absolute top-2 right-2 text-gray-600"
            >
              ✕
            </button>

            {!isEditing ? (
              <>
                <h3 className="text-xl font-bold mb-4">Captain Details</h3>
                <p><b>Name:</b> {selectedCaptain.name}</p>
                <p><b>Branch:</b> {selectedCaptain.branch}</p>
                <p><b>Year:</b> {selectedCaptain.year}</p>
                <p><b>URN:</b> {selectedCaptain.urn}</p>
                <p><b>Sport:</b> {selectedCaptain.sport}</p>
                <p><b>Email:</b> {selectedCaptain.email || "N/A"}</p>
                <p><b>Phone:</b> {selectedCaptain.phone || "N/A"}</p>

                <h4 className="mt-4 font-semibold">Team Members</h4>
                {selectedCaptain.teamMembers.length > 0 ? (
                  <ul className="list-disc list-inside ml-4">
                    {selectedCaptain.teamMembers.map((member, index) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          {member.name} ({member.branch}, {member.year}) – URN:{" "}
                          {member.urn}, Email: {member.email}, Phone: {member.phone}
                        </span>
                        <button
                          onClick={() =>
                            handleDeleteMember(selectedCaptain._id, index)
                          }
                          className="text-red-600 ml-2"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No team members added.</p>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => handleDeleteCaptain(selectedCaptain._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete Captain
                  </button>
                  <button
                    onClick={() => startEditing(selectedCaptain)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Edit Captain
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Edit Captain</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(editForm).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium capitalize">
                        {field}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={editForm[field]}
                        onChange={handleEditChange}
                        className="border rounded p-2 w-full"
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
                    onClick={handleEditSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CaptainsAndTeams;
