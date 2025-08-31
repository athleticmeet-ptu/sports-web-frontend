import { useState, useEffect } from "react";
import API from "../services/api";

const AssignPosition = () => {
  const [captains, setCaptains] = useState([]);
  const [positionData, setPositionData] = useState({});
  const [message, setMessage] = useState("");
  const [sportFilter, setSportFilter] = useState("");

  // Fetch captains on mount
  useEffect(() => {
    const fetchCaptains = async () => {
      try {
        const res = await API.get("/admin/captains");
        
        // Use a consistent ID field (prefer _id if available)
        const uniqueCaptains = Array.from(
          new Map(
            res.data.map(c => [
              c.captainId || c._id,
              { 
                ...c, 
                // Use a consistent ID field
                id: c.captainId || c._id,
                assignedPosition: c.position || c.assignedPosition || "" 
              },
            ])
          ).values()
        );

        setCaptains(uniqueCaptains);
      } catch (err) {
        console.error("Error fetching captains:", err);
      }
    };
    fetchCaptains();
  }, []);

  const handlePositionChange = (captainId, value) => {
    setPositionData((prev) => ({
      ...prev,
      [captainId]: value,
    }));
  };

  const handleAssign = async (captainId) => {
    const position = positionData[captainId];
    if (!position) {
      alert("⚠ Please select a position first!");
      return;
    }

    try {
      const res = await API.post("/admin/assign-position", {
        captainId,
        position,
      });
      setMessage(res.data.message);

      // Reset local select
      setPositionData((prev) => ({
        ...prev,
        [captainId]: "",
      }));

      // Update local state to mark as assigned
      setCaptains((prev) =>
        prev.map((c) =>
          (c.captainId === captainId || c._id === captainId)
            ? { ...c, assignedPosition: position }
            : c
        )
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Error assigning position");
    }
  };

  // Filter captains by sport without re-deduplicating
  const filteredCaptains = captains.filter(c =>
    sportFilter
      ? c.sport && c.sport.toLowerCase().includes(sportFilter.toLowerCase())
      : true
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Assign Team Positions</h2>

      {message && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {/* Sport Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by sport..."
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded"
        />
      </div>

      {filteredCaptains.length === 0 && (
        <p className="text-center text-gray-500">No captains available.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCaptains.map((c) => {
          const captainId = c.captainId || c._id;
          const isAssigned = !!c.assignedPosition;

          return (
            <div
              key={captainId}
              className={`p-4 rounded-lg shadow-md flex flex-col justify-between ${
                isAssigned ? "bg-gray-100 opacity-70" : "bg-white"
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-600">
                  URN: {c.urn || "-"} | Sport: {c.sport || "-"} | Branch: {c.branch || "-"} | Year: {c.year || "-"}
                </p>
              </div>

              {isAssigned ? (
                <span className="mt-3 text-green-600 font-medium">
                  Assigned: {c.assignedPosition}
                </span>
              ) : (
                <div className="flex gap-2 mt-3">
                  <select
                    value={positionData[captainId] || ""}
                    onChange={(e) =>
                      handlePositionChange(captainId, e.target.value)
                    }
                    className="p-2 border rounded flex-1"
                  >
                    <option value="">Select Position</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="participated">Participated</option>
                  </select>
                  <button
                    onClick={() => handleAssign(captainId)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignPosition;