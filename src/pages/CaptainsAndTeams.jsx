// frontend/src/pages/CaptainsAndTeams.jsx
import React, { useEffect, useState } from "react";

function CaptainsAndTeams() {
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    branch: "",
    year: "",
    urn: "",
    email: "",
    phone: "",
    sport: "",
    position: "",
  });

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

  const handleDeleteMember = async (captainId, sessionId, memberIndex) => {
    if (!window.confirm("Delete this team member?")) return;
    try {
      await fetch(`/api/admin/${captainId}/${sessionId}/members/${memberIndex}`, {
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

  // --- MEMBER EDIT ---
  const startEditingMember = (member, index) => {
    setEditingMemberIndex(index);
    setMemberForm(member);
  };

  const handleMemberChange = (e) => {
    setMemberForm({ ...memberForm, [e.target.name]: e.target.value });
  };

  const handleMemberSubmit = async () => {
    try {
      const res = await fetch(
        `/api/admin/${selectedCaptain.captainId}/${selectedCaptain.sessionId}/members/${editingMemberIndex}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberForm),

        }
      );

      if (!res.ok) throw new Error("Failed to update member");

      const updatedData = await res.json();

      // update state
          setSelectedCaptain({
      ...selectedCaptain,
      teamMembers: updatedData.teamMembers,
    });
    
      setEditingMemberIndex(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- CAPTAIN EDIT ---
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
      position: captain.position || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

const handleEditSubmit = async () => {
  try {
    // agar captain ne koi position select ki hai, toh usi ko members ko bhi assign karo
    const updatedData = {
      ...editForm,
      teamMembers: selectedCaptain.teamMembers.map((m) => ({
        ...m,
        position: editForm.position || m.position, // captain ki position members ko bhi
      })),
    };

    const res = await fetch(`/api/admin/captains/${selectedCaptain._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error("Failed to update captain");

    const updatedCaptain = await res.json();

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
          <p>Position: {captain.position || "Not Assigned"}</p>

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
            onClick={() => {
              setSelectedCaptain(null);
              setEditingMemberIndex(null);
            }}
            className="absolute top-2 right-2 text-gray-600"
          >
            ✕
          </button>

          {/* Show captain details */}
          {!isEditing && editingMemberIndex === null ? (
            <>
              <h3 className="text-xl font-bold mb-4">Captain Details</h3>
              <p><b>Name:</b> {selectedCaptain.name}</p>
              <p><b>Branch:</b> {selectedCaptain.branch}</p>
              <p><b>Year:</b> {selectedCaptain.year}</p>
              <p><b>URN:</b> {selectedCaptain.urn}</p>
              <p><b>Sport:</b> {selectedCaptain.sport}</p>
              <p><b>Position:</b> {selectedCaptain.position || "Not Assigned"}</p>
              <p><b>Email:</b> {selectedCaptain.email || "N/A"}</p>
              <p><b>Phone:</b> {selectedCaptain.phone || "N/A"}</p>

              <h4 className="mt-4 font-semibold">Team Members</h4>
              {selectedCaptain.teamMembers && selectedCaptain.teamMembers.length > 0 ? (
                <ul className="list-disc list-inside ml-4">
                  {selectedCaptain.teamMembers.map((member, index) => (
                    <li key={index} className="flex justify-between">
                      <span>
                        {member.name} ({member.branch}, {member.year}) – URN:{" "}
                        {member.urn}, Email: {member.email}, Phone: {member.phone}, Position:{" "}
                        {member.position || selectedCaptain.position || "N/A"}
                      </span>
                      <div>
                        <button
                          onClick={() => startEditingMember(member, index)}
                          className="text-blue-600 ml-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteMember(
                              selectedCaptain._id,
                              selectedCaptain.sessionId,
                              index
                            )
                          }
                          className="text-red-600 ml-2"
                        >
                          Delete
                        </button>
                      </div>
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
          ) : null}

          {/* Member Editing Form */}
          {editingMemberIndex !== null && (
            <>
              <h3 className="text-xl font-bold mb-4">Edit Team Member</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(memberForm).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium capitalize">
                      {field}
                    </label>
                    {field === "position" ? (
                      <input
                        type="text"
                        name={field}
                        value={selectedCaptain.position || ""}
                        disabled
                        className="border rounded p-2 w-full bg-gray-100"
                      />
                    ) : (
                      <input
                        type="text"
                        name={field}
                        value={memberForm[field]}
                        onChange={handleMemberChange}
                        className="border rounded p-2 w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setEditingMemberIndex(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMemberSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </>
          )}

          {/* Captain Editing Form */}
          {isEditing && editingMemberIndex === null && (
            <>
              <h3 className="text-xl font-bold mb-4">Edit Captain</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(editForm).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium capitalize">
                      {field}
                    </label>
                    {field === "position" ? (
                      <select
                        name="position"
                        value={editForm.position || ""}
                        onChange={handleEditChange}
                        className="border rounded p-2 w-full"
                      >
                        <option value="">Select Position</option>
                        <option value="1st">1st</option>
                        <option value="2nd">2nd</option>
                        <option value="3rd">3rd</option>
                        <option value="Participated">Participated</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field}
                        value={editForm[field]}
                        onChange={handleEditChange}
                        className="border rounded p-2 w-full"
                      />
                    )}
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
