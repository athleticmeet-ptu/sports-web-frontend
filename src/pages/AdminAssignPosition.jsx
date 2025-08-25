// src/components/AdminAssignPosition.jsx
import { useEffect, useState } from "react";
import API from "../services/api"; // axios instance

const AdminAssignPosition = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [position, setPosition] = useState("");

  // ✅ Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/admin/students"); // backend route
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    };
    fetchStudents();
  }, []);

  // ✅ When student changes, fetch sports
  useEffect(() => {
    if (selectedStudent) {
      const student = students.find((s) => s._id === selectedStudent);
      if (student) {
        setSports(student.sports || []); // fetch only sports already filled by student
        setSelectedSport("");
      }
    } else {
      setSports([]);
      setSelectedSport("");
    }
  }, [selectedStudent, students]);

  // ✅ Assign position handler
  const handleAssign = async () => {
    if (!selectedStudent || !selectedSport || !position) {
      alert("⚠ Please select all fields");
      return;
    }

    try {
      await API.put(`/admin/students/${selectedStudent}/assign-sport-position`, {
        sportName: selectedSport,
        position,
      });

      alert("✅ Position assigned successfully!");
      setSelectedSport("");
      setPosition("");
    } catch (err) {
      console.error("Error assigning position", err);
      alert("❌ Failed to assign position");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Assign Sport Position</h2>

      {/* Select Student */}
      <label className="block mb-2 font-medium">Select Student</label>
      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Choose Student --</option>
        {students.map((student) => (
          <option key={student._id} value={student._id}>
            {student.name} ({student.urn})
          </option>
        ))}
      </select>

      {/* Select Sport */}
      <label className="block mb-2 font-medium">Select Sport</label>
      <select
        value={selectedSport}
        onChange={(e) => setSelectedSport(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Choose Sport --</option>
        {sports.map((sport, idx) => (
          <option key={idx} value={sport}>
            {sport}
          </option>
        ))}
      </select>

      {/* Select Position */}
      <label className="block mb-2 font-medium">Select Position</label>
      <select
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Choose Position --</option>
        <option value="1st">1st</option>
        <option value="2nd">2nd</option>
        <option value="3rd">3rd</option>
      </select>

      <button
        onClick={handleAssign}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Assign Position
      </button>
    </div>
  );
};

export default AdminAssignPosition;
