// src/components/AttendanceDashboard.jsx
import { useState, useEffect } from "react";
import API from "../services/api";

const AttendanceDashboard = ({defaultSport}) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ name: "", branch: "", urn: "", crn: "", year: "", sport:defaultSport || "Gym", email: "", phone: "" });
  const [dateOffset, setDateOffset] = useState(0);

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => { loadSessions(); loadStudents(); }, []);
  useEffect(() => { if (selectedSession) loadAttendance(date, selectedSession); }, [date, selectedSession]);

  const normalizeDate = (d) => new Date(d).toISOString().split("T")[0];

  const loadSessions = async () => {
    try {
      const res = await API.get("/session");
      setSessions(res.data);
      if (res.data.length > 0) {
        const active = res.data.find((s) => s.isActive) || res.data[0];
        setSelectedSession(active._id);
      }
    } catch (err) { console.error("Failed to fetch sessions", err); }
  };

  const loadStudents = async () => {
    try {
      const res = await API.get("/gym-swimming");
      const filtered = res.data.filter(s => s.sport === (defaultSport || "Gym"));
      setStudents(filtered);
    } catch (err) { console.error("Failed to fetch students", err); }
  };

  const loadAttendance = async (selectedDate, sessionId) => {
    try {
      const res = await API.get(`/attendance/${selectedDate}?sessionId=${sessionId}`);
      const records = {};
      res.data.forEach((r) => {
        const studentId = r.student?._id || r.studentId || r._id;
        if (studentId) {
          records[`${studentId}_${sessionId}`] = {
            status: r.status,
            sessionId: r.session?._id || r.session,
            date: normalizeDate(r.date),
          };
        }
      });
      setAttendance(records);
    } catch (err) { console.error("Failed to fetch attendance", err); }
  };

  const handleSaveStudent = async () => {
    try {
      if (editStudent) await API.put(`/gym-swimming/${editStudent._id}`, form);
      else await API.post("/gym-swimming/add", form);
      setShowForm(false); setForm({ name: "", branch: "", urn: "", crn: "", year: "", sport: "Gym", email: "", phone: "" });
      setEditStudent(null); loadStudents();
    } catch (err) { console.error("Failed to save student", err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await API.delete(`/gym-swimming/${id}`);
      loadStudents();
    }
  };

  const handleAttendance = async (studentId, status, forDate) => {
    try {
      const res = await API.post("/attendance/mark", { studentId, status, sessionId: selectedSession, markedBy: "ADMIN_ID", date: forDate });
      const record = res.data.record;
      const key = `${studentId}_${selectedSession}`;
      setAttendance({ ...attendance, [key]: { status: record.status, sessionId: record.session, date: normalizeDate(record.date) } });
    } catch (err) { console.error("Failed to mark attendance", err); }
  };

// Months mapping
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec"];


// Get date block within session range
const getDateBlock = () => {
  const days = [];
  if (!selectedSession) return days;

  const sessionObj = sessions.find(s => s._id === selectedSession);
  if (!sessionObj) return days;

  // Assume sessionObj.session format: "May–Dec 2025"
  const [range, yearStr] = sessionObj.session.split(" "); // ["May–Dec", "2025"]
  const [startMonthStr, endMonthStr] = range.split("–"); // ["May", "Dec"]
  const year = parseInt(yearStr);

  const startMonth = monthNames.indexOf(startMonthStr);
  const endMonth = monthNames.indexOf(endMonthStr);

  // Current date offset logic (10-day block)
  let current = new Date(year, startMonth, 1);
  current.setDate(current.getDate() + dateOffset * 10);

  for (let i = 0; i < 10; i++) {
    // Stop if we cross end month
    if (current.getMonth() > endMonth || current.getFullYear() > year) break;
    days.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return days;
};



  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gym & Swimming Attendance</h2>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Session:</label>
        <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="border p-2 rounded">
          {sessions.map((s) => (<option key={s._id} value={s._id}>{s.session} {s.isActive ? "(Active)" : ""}</option>))}
        </select>
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setDateOffset(dateOffset - 1)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">⬅ Prev 10 days</button>
        {getDateBlock().map((d) => (
          <button key={d} onClick={() => setDate(d)} className={`px-4 py-2 rounded ${date === d ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{d}</button>
        ))}
        <button onClick={() => setDateOffset(dateOffset + 1)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Next 10 days ➡</button>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ml-4 border p-2 rounded" />
      </div>
      <div className="mb-4 text-lg font-semibold text-gray-700">📅 Showing attendance for: <span className="text-blue-600">{date}</span></div>

      {/* Student Table */}
      <table className="w-full border rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th><th className="p-2">URN</th><th className="p-2">CRN</th><th className="p-2">Branch</th><th className="p-2">Year</th><th className="p-2">Sport</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Attendance</th><th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((st) => {
            const att = attendance[`${st._id}_${selectedSession}`];
            return (
              <tr key={st._id} className="border-b">
                <td className="p-2">{st.name}</td>
                <td className="p-2">{st.urn}</td>
                <td className="p-2">{st.crn}</td>
                <td className="p-2">{st.branch}</td>
                <td className="p-2">{st.year}</td>
                <td className="p-2">{st.sport}</td>
                <td className="p-2">{st.email || "-"}</td>
                <td className="p-2">{st.phone || "-"}</td>
                <td className="p-2">
                  <div className="mb-2">{att?.status && att?.date === date ? (<span className={`font-bold ${att.status === "Present" ? "text-green-600" : "text-red-600"}`}>{att.status === "Present" ? "✅ Present" : "❌ Absent"}</span>) : (<span className="text-gray-500">Not Marked</span>)}</div>
                  <div>
                    <button onClick={() => handleAttendance(st._id, "Present", date)} className="px-3 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600">Mark Present</button>
                    <button onClick={() => handleAttendance(st._id, "Absent", date)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Mark Absent</button>
                  </div>
                </td>
                <td className="p-2">
                  <button onClick={() => { setEditStudent(st); setForm(st); setShowForm(true); }} className="px-3 py-1 bg-yellow-400 rounded mr-2 hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDelete(st._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add Student Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">{editStudent ? "Edit Student" : "Add Student"}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveStudent(); }} className="flex flex-col gap-3">
              <input name="name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="border p-2 rounded"/>
              <input name="branch" placeholder="Branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required className="border p-2 rounded"/>
              <input name="urn" placeholder="URN" value={form.urn} onChange={(e) => setForm({ ...form, urn: e.target.value })} required className="border p-2 rounded"/>
              <input name="crn" placeholder="CRN" value={form.crn} onChange={(e) => setForm({ ...form, crn: e.target.value })} required className="border p-2 rounded"/>
              <input type="number" name="year" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required className="border p-2 rounded"/>
              <select name="sport" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="border p-2 rounded">
                <option value={defaultSport}>{defaultSport}</option>
              </select>
              <input name="email" type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2 rounded"/>
              <input name="phone" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2 rounded"/>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => { setShowForm(false); setEditStudent(null); }} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editStudent ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
