import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "../components/ui/modal";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  UserPlus,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import API from "../services/api";

// Separate Heading Component
const AttendanceHeading = ({ defaultSport }) => (
  <div>
    <h1 className="text-3xl font-bold text-foreground">{defaultSport} Attendance</h1>
    <p className="text-muted-foreground mt-1">Manage attendance for {defaultSport} students</p>
  </div>
);

const AttendanceDashboard = ({ defaultSport }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceCounts, setAttendanceCounts] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    branch: "",
    urn: "",
    crn: "",
    year: "",
    sport: defaultSport || "Gym",
    email: "",
    phone: ""
  });
  const [dateOffset, setDateOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [urnFilter, setUrnFilter] = useState("");

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => { loadSessions(); loadStudents(); }, []);
  useEffect(() => { if (selectedSession) loadAttendance(date, selectedSession); }, [date, selectedSession]);
  useEffect(() => { calculateAttendanceCounts(); }, [attendance, selectedSession]);

  const normalizeDate = (d) => new Date(d).toISOString().split("T")[0];

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/session");
      setSessions(res.data);
      if (res.data.length > 0) {
        const active = res.data.find((s) => s.isActive) || res.data[0];
        setSelectedSession(active._id);
      }
    } catch (err) { 
      console.error("Failed to fetch sessions", err);
      setError("Failed to load sessions");
    } finally { setLoading(false); }
  };

  const loadStudents = async () => {
    try {
      const res = await API.get("/gym-swimming");
      const filtered = res.data.filter(s => s.sport === (defaultSport || "Gym"));
      setStudents(filtered);
    } catch (err) { 
      console.error("Failed to fetch students", err);
      setError("Failed to load students");
    }
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

  const calculateAttendanceCounts = () => {
    const counts = {};
    Object.entries(attendance).forEach(([key, record]) => {
      if (record.sessionId === selectedSession && record.status === "Present") {
        const studentId = key.split('_')[0];
        counts[studentId] = (counts[studentId] || 0) + 1;
      }
    });
    setAttendanceCounts(counts);
  };

  // Validate email
  const isValidEmail = (email) => {
    if (!email) return true; // optional field
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSaveStudent = async () => {
    if (!isValidEmail(form.email)) {
      return alert("Please enter a valid email address");
    }
    try {
      setSubmitLoading(true);
      const studentData = { ...form, session: selectedSession };
      if (editStudent) {
        await API.put(`/gym-swimming/${editStudent._id}`, studentData);
      } else {
        await API.post("/gym-swimming/add", studentData);
      }
      setShowForm(false);
      setForm({ name: "", branch: "", urn: "", crn: "", year: "", sport: defaultSport || "Gym", email: "", phone: "" });
      setEditStudent(null);
      loadStudents();
      loadAttendance(date, selectedSession);
    } catch (err) { 
      console.error("Failed to save student", err);
      setError("Failed to save student");
    } finally { setSubmitLoading(false); }
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
      calculateAttendanceCounts();
    } catch (err) { console.error("Failed to mark attendance", err); }
  };

  // 10-day block from current date
  const getDateBlock = () => {
    const days = [];
    let current = new Date();
    current.setDate(current.getDate() + dateOffset * 10);
    for (let i = 0; i < 10; i++) {
      days.push(normalizeDate(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><RefreshCw className="w-6 h-6 animate-spin text-primary" /><span className="ml-2">Loading attendance data...</span></div>;
  if (error) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => { loadSessions(); loadStudents(); }} variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Try Again</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between">
  <AttendanceHeading defaultSport={defaultSport || "Gym"} />
  <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
    <Plus className="w-4 h-4" />Add Student
  </Button>
</motion.div>


      {/* Session Selector + Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4" />Select Session:</label>
            <Select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
              {sessions.map(s => <option key={s._id} value={s._id}>{s.session} {s.isActive ? "(Active)" : ""}</option>)}
            </Select>
            <div className="space-y-1"><label className="text-sm font-medium text-foreground">Filter by Name</label><Input value={nameFilter} onChange={(e)=>setNameFilter(e.target.value)} placeholder="e.g. John" /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-foreground">Filter by URN</label><Input value={urnFilter} onChange={(e)=>setUrnFilter(e.target.value)} placeholder="e.g. 21XXXX" /></div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Date Navigation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" />Date Navigation</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Button onClick={() => setDateOffset(dateOffset - 1)} variant="outline" size="sm" className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" />Prev 10 days</Button>
              {getDateBlock().map(d => <Button key={d} onClick={() => setDate(d)} variant={date===d?"default":"outline"} size="sm">{d}</Button>)}
              <Button onClick={() => setDateOffset(dateOffset + 1)} variant="outline" size="sm" className="flex items-center gap-2">Next 10 days<ChevronRight className="w-4 h-4" /></Button>
              <div className="ml-4"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" /></div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Showing attendance for: <span className="text-primary">{date}</span></span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Students List (unchanged, can keep your existing code here) */}
      {/* Add Student Modal (unchanged except email validation included) */}
    </div>
  );
};

export default AttendanceDashboard;
