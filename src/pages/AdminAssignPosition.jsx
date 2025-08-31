import { useEffect, useState } from "react";
import API from "../services/api";

const AdminAssignPosition = () => {
  const [students, setStudents] = useState([]);
  const [positionData, setPositionData] = useState({});
  const [sportFilter, setSportFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [bulkPosition, setBulkPosition] = useState("");
  const [bulkSport, setBulkSport] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/admin/students");
        // Filter out students who have all positions assigned
        const pendingStudents = res.data.filter(student => 
          !student.positions || 
          student.positions.length === 0 || 
          (student.sports || []).some(sport => 
            !student.positions.some(p => p.sport === sport)
          )
        );
        setStudents(pendingStudents);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    };
    fetchStudents();
  }, []);

  const handlePositionChange = (studentId, sportName, value) => {
    setPositionData((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [sportName]: value,
      },
    }));
  };

  const handleAssign = async (studentId, sportName) => {
    const position = positionData[studentId]?.[sportName];
    if (!position) {
      alert("⚠ Please select a position first!");
      return;
    }

    try {
      await API.put(`/admin/students/${studentId}/assign-sport-position`, {
        sportName,
        position,
      });
      setMessage(`✅ ${sportName} position assigned successfully!`);

      // Reset select
      setPositionData((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [sportName]: "",
        },
      }));

      // Update local state and remove if all positions are assigned
      setStudents((prev) => {
        const updatedStudents = prev.map((student) => {
          if (student._id === studentId) {
            const newPositions = [
              ...(student.positions || []),
              { sport: sportName, position },
            ];
            
            return {
              ...student,
              positions: newPositions,
            };
          }
          return student;
        });
        
        // Filter out students who now have all positions assigned
        return updatedStudents.filter(student => 
          (student.sports || []).some(sport => 
            !student.positions?.some(p => p.sport === sport)
          )
        );
      });
    } catch (err) {
      console.error("Error assigning position", err);
      setMessage("❌ Failed to assign position");
    }
  };

  // Handle bulk assignment
  const handleBulkAssign = async () => {
    if (selectedStudents.size === 0) {
      setMessage("⚠ Please select at least one student");
      return;
    }

    if (!bulkPosition) {
      setMessage("⚠ Please select a position for bulk assignment");
      return;
    }

    if (!bulkSport) {
      setMessage("⚠ Please select a sport for bulk assignment");
      return;
    }

    try {
      const assignments = [];
      for (const studentId of selectedStudents) {
        const student = students.find(s => s._id === studentId);
        // Only assign if student has this sport and it's not already assigned
        if (student && student.sports && student.sports.includes(bulkSport)) {
          const isAlreadyAssigned = student.positions?.some(p => 
            p.sport === bulkSport
          );
          
          if (!isAlreadyAssigned) {
            assignments.push(
              API.put(`/admin/students/${studentId}/assign-sport-position`, {
                sportName: bulkSport,
                position: bulkPosition,
              })
            );
          }
        }
      }

      await Promise.all(assignments);
      setMessage(`✅ Position ${bulkPosition} for ${bulkSport} assigned to ${assignments.length} students!`);
      
      // Update local state and remove students with all positions assigned
      setStudents(prev => {
        const updatedStudents = prev.map(student => {
          if (selectedStudents.has(student._id) && 
              student.sports && 
              student.sports.includes(bulkSport) &&
              !student.positions?.some(p => p.sport === bulkSport)) {
            const newPositions = [
              ...(student.positions || []),
              { sport: bulkSport, position: bulkPosition },
            ];
            return { ...student, positions: newPositions };
          }
          return student;
        });
        
        // Filter out students who now have all positions assigned
        return updatedStudents.filter(student => 
          (student.sports || []).some(sport => 
            !student.positions?.some(p => p.sport === sport)
          )
        );
      });

      // Clear selection
      setSelectedStudents(new Set());
      setBulkPosition("");
    } catch (err) {
      console.error("Error in bulk assignment", err);
      setMessage("❌ Failed to assign positions to some students");
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s._id)));
    }
  };

  // Get unique sports from all pending students
  const getAvailableSports = () => {
    const sports = new Set();
    filteredStudents.forEach(student => {
      (student.sports || []).forEach(sport => {
        // Only include sports that aren't already assigned for this student
        if (!student.positions?.some(p => p.sport === sport)) {
          sports.add(sport);
        }
      });
    });
    return Array.from(sports);
  };

  // Filter students by sport and name
  const filteredStudents = students.filter((student) => {
    const matchesSport = sportFilter
      ? (student.sports || []).some((s) =>
          s.toLowerCase().includes(sportFilter.toLowerCase())
        )
      : true;
    
    const matchesName = nameFilter
      ? student.name?.toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    
    return matchesSport && matchesName;
  });

  const availableSports = getAvailableSports();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-indigo-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Assign Sport Positions
            </h2>
            <p className="text-gray-600">
              Manage pending position assignments for students
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-center font-medium ${
              message.includes("✅") 
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300" 
                : "bg-rose-100 text-rose-700 border border-rose-300"
            }`}>
              {message}
            </div>
          )}

          {/* Filters and Bulk Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Sport
              </label>
              <input
                type="text"
                placeholder="e.g. Basketball, Football..."
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Name
              </label>
              <input
                type="text"
                placeholder="Search student name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulk Assign Position
              </label>
              <div className="space-y-2">
                <select
                  value={bulkSport}
                  onChange={(e) => setBulkSport(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Sport</option>
                  {availableSports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <select
                  value={bulkPosition}
                  onChange={(e) => setBulkPosition(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Position</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!bulkPosition || !bulkSport || selectedStudents.size === 0}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign to Selected
                </button>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col justify-center">
              <div className="text-center">
                <span className="block text-amber-800 font-semibold">
                  {selectedStudents.size} selected
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="text-amber-700 hover:text-amber-900 font-medium text-sm mt-1"
                >
                  {selectedStudents.size === filteredStudents.length ? "Deselect All" : "Select All"}
                </button>
              </div>
            </div>
          </div>

          {/* Student Cards */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No pending students found matching your filters.</p>
              <p className="text-gray-400 text-sm mt-2">All position assignments are complete!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => {
                const pendingSports = (student.sports || []).filter(sport => 
                  !student.positions?.some(p => p.sport === sport)
                );

                return (
                  <div
                    key={student._id}
                    className={`bg-white rounded-2xl shadow-md overflow-hidden border-l-4 ${
                      pendingSports.length === 0 ? "border-emerald-500" : "border-amber-500"
                    } ${selectedStudents.has(student._id) ? "ring-2 ring-indigo-500" : ""}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student._id)}
                            onChange={() => toggleStudentSelection(student._id)}
                            className="h-5 w-5 text-indigo-600 rounded mr-3"
                          />
                          <img
                            src={
                              student.photo ||
                              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            }
                            alt={student.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pendingSports.length === 0 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {pendingSports.length === 0 ? "All Assigned" : `${pendingSports.length} Pending`}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          URN: {student.urn || "-"} • {student.branch || "-"} • {student.year || "-"}
                        </p>
                      </div>

                      {pendingSports.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Pending Assignments:</h4>
                          {pendingSports.map((sport, idx) => {
                            const currentSelection =
                              positionData[student._id]?.[sport] || "";

                            return (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700">
                                  {sport}
                                </span>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={currentSelection}
                                    onChange={(e) =>
                                      handlePositionChange(student._id, sport, e.target.value)
                                    }
                                    className="p-1.5 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Position</option>
                                    <option value="1st">1st</option>
                                    <option value="2nd">2nd</option>
                                    <option value="3rd">3rd</option>
                                  </select>
                                  <button
                                    onClick={() => handleAssign(student._id, sport)}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded text-sm hover:from-indigo-600 hover:to-purple-600"
                                  >
                                    Assign
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-emerald-700 text-sm text-center py-2 bg-emerald-100 rounded-lg">
                          All positions assigned ✓
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignPosition;