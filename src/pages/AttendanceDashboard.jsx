// src/components/AttendanceDashboard.jsx
import { useState, useEffect } from "react";
import API from "../services/api";

const AttendanceDashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");

  const [month, setMonth] = useState(new Date().getMonth()); // 0 = Jan
  const [year, setYear] = useState(new Date().getFullYear());

  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    branch: "",
    urn: "",
    crn: "",
    year: "",
    sport: "Gym",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadSessions();
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadAttendance();
    }
  }, [month, year, selectedSession]);

  const loadSessions = async () => {
    try {
      const res = await API.get("/session");
      setSessions(res.data);
      if (res.data.length > 0) {
        const active = res.data.find((s) => s.isActive) || res.data[0];
        setSelectedSession(active._id);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await API.get("/gym-swimming");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const loadAttendance = async () => {
    try {
      const start = new Date(year, month, 1).toISOString().split("T")[0];
      const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const res = await API.get(
        `/attendance/range?start=${start}&end=${end}&sessionId=${selectedSession}`
      );

      const records = {};
      res.data.forEach((r) => {
        const studentId = r.student?._id || r.studentId || r._id;
        const day = new Date(r.date).getDate();
        if (!records[studentId]) records[studentId] = {};
        records[studentId][day] = r.status;
      });
      setAttendance(records);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  const handleAttendance = async (studentId, status, dateStr, day) => {
    try {
      await API.post("/attendance/mark", {
        studentId,
        status,
        sessionId: selectedSession,
        markedBy: "ADMIN_ID",
        date: dateStr,
      });

      setAttendance((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], [day]: status },
      }));
    } catch (err) {
      console.error("Failed to mark attendance", err);
    }
  };

  const handleSaveStudent = async () => {
    try {
      if (editStudent) {
        await API.put(`/gym-swimming/${editStudent._id}`, form);
      } else {
        await API.post("/gym-swimming/add", form);
      }
      setShowForm(false);
      setForm({
        name: "",
        branch: "",
        urn: "",
        crn: "",
        year: "",
        sport: "Gym",
        email: "",
        phone: "",
      });
      setEditStudent(null);
      loadStudents();
    } catch (err) {
      console.error("Failed to save student", err);
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🏊 Gym & Swimming Attendance</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:scale-105 transition"
        >
          ➕ Add Student
        </button>
      </div>

      {/* Session Selector */}
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-semibold">Select Session:</label>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="border p-2 rounded"
        >
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.session} {s.isActive ? "(Active)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => {
            if (month === 0) {
              setMonth(11);
              setYear((y) => y - 1);
            } else {
              setMonth((m) => m - 1);
            }
          }}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          ⬅ Prev
        </button>
        <span className="text-lg font-bold">
          {monthName} {year}
        </span>
        <button
          onClick={() => {
            if (month === 11) {
              setMonth(0);
              setYear((y) => y + 1);
            } else {
              setMonth((m) => m + 1);
            }
          }}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Next ➡
        </button>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-max border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">URN</th>
              <th className="p-2 border">Branch</th>
              <th className="p-2 border">Year</th>
              <th className="p-2 border">Sport</th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i} className="p-2 border text-center">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((st) => (
              <tr key={st._id} className="border-b">
                <td className="p-2 border">{st.name}</td>
                <td className="p-2 border">{st.urn}</td>
                <td className="p-2 border">{st.branch}</td>
                <td className="p-2 border">{st.year}</td>
                <td className="p-2 border">{st.sport}</td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(
                    2,
                    "0"
                  )}-${String(day).padStart(2, "0")}`;
                  const status = attendance[st._id]?.[day];
                  return (
                    <td key={day} className="p-1 border text-center">
                      {status ? (
                        <span
                          className={`font-bold ${
                            status === "Present"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {status === "Present" ? "P" : "A"}
                        </span>
                      ) : (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() =>
                              handleAttendance(st._id, "Present", dateStr, day)
                            }
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                          >
                            P
                          </button>
                          <button
                            onClick={() =>
                              handleAttendance(st._id, "Absent", dateStr, day)
                            }
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                          >
                            A
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Student Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">
              {editStudent ? "Edit Student" : "Add Student"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveStudent();
              }}
              className="flex flex-col gap-3"
            >
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                name="branch"
                placeholder="Branch"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                name="urn"
                placeholder="URN"
                value={form.urn}
                onChange={(e) => setForm({ ...form, urn: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                name="crn"
                placeholder="CRN"
                value={form.crn}
                onChange={(e) => setForm({ ...form, crn: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <input
                type="number"
                name="year"
                placeholder="Year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                required
                className="border p-2 rounded"
              />
              <select
                name="sport"
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="Gym">Gym</option>
                <option value="Swimming">Swimming</option>
              </select>
              <input
                name="email"
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border p-2 rounded"
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditStudent(null);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editStudent ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
