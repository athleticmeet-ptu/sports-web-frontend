import { useState, useEffect } from "react";
import API from "../services/api";

const AssignPosition = () => {
  const [captains, setCaptains] = useState([]);
  const [selectedCaptain, setSelectedCaptain] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");

  // Fetch captains on mount
  useEffect(() => {
    const fetchCaptains = async () => {
      try {
        const res = await API.get("/admin/captains");
        setCaptains(res.data);
      } catch (err) {
        console.error("Error fetching captains:", err);
      }
    };
    fetchCaptains();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaptain || !position) return;

    try {
      const res = await API.post("/admin/assign-position", {
        captainId: selectedCaptain,
        position: position,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error assigning position");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Assign Team Position</h2>

      {message && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Captain dropdown */}
        <div>
          <label className="block font-medium mb-1">Select Captain</label>
          <select
            value={selectedCaptain}
            onChange={(e) => setSelectedCaptain(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            required
          >
            <option value="">-- Select Captain --</option>
            {captains.map((c) => (
              <option key={c.captainId} value={c.captainId}>
                {c.name} ({c.sport}, {c.branch}, Year {c.year})
              </option>
            ))}
          </select>
        </div>

        {/* Position input */}
<div>
  <label className="block font-medium mb-1">Position</label>
  <select
    value={position}
    onChange={(e) => setPosition(e.target.value)}
    className="w-full border px-3 py-2 rounded-md"
    required
  >
    <option value="">Select Position</option>
    <option value="1st">1st</option>
    <option value="2nd">2nd</option>
    <option value="3rd">3rd</option>
    <option value="participated">Participated</option>
  </select>
</div>


        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Assign Position
        </button>
      </form>
    </div>
  );
};

export default AssignPosition;
