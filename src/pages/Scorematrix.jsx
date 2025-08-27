import { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]); // only full-year sessions
  const [selectedSession, setSelectedSession] = useState("");

  // 🔹 Fetch sessions on mount
  useEffect(() => {
    API.get("/session")
      .then((res) => {
        if (!res.data) return;

        // extract unique years
        const years = new Set();
        res.data.forEach((s) => {
          if (s.session) {
            const match = s.session.match(/\b(\d{4})\b/); // extract year
            if (match) years.add(match[1]);
          }
        });

        // create full year options like Jan–Dec YYYY
        const fullSessions = Array.from(years).map((year) => ({
          _id: `year-${year}`, // fake id for dropdown
          session: `Jan–Dec ${year}`,
          year,
        }));

        setSessions(fullSessions);

        // preselect current year if available
        const currentYear = new Date().getFullYear();
        const active = fullSessions.find((s) => s.year === String(currentYear));
        if (active) setSelectedSession(active._id);
      })
      .catch((err) => console.error("Error fetching sessions:", err));
  }, []);

  // 🔹 Fetch students whenever selectedSession (year) changes
  useEffect(() => {
    if (!selectedSession) return;

    const selected = sessions.find((s) => s._id === selectedSession);
    if (!selected) return;

    // call backend with full-year param (e.g. Jan-Dec 2025)
    API.get("/admin/students-unique", {
      params: { session: selected.session },
    })
      .then((res) => setStudents(res.data || []))
      .catch((err) => console.error("Error fetching students:", err));
  }, [selectedSession, sessions]);

  // 🔹 Score Calculation
const getScore = (student) => {
  let total = 0;

  const multipliers = {
    international: { "1st": 60, "2nd": 58, "3rd": 56, participated: 55 },
    national: { "1st": 55, "2nd": 53, "3rd": 51, participated: 50 },
    state: { "1st": 50, "2nd": 48, "3rd": 46, participated: 45 },
    institute: { "1st": 45, "2nd": 43, "3rd": 41, participated: 15 },
  };

  student.sports.forEach((sport, i) => {
    let rawPos = (student.positions?.[i] || "").toString().toLowerCase();

    // normalize position
    let position = "";
    if (["participation", "participated"].includes(rawPos)) position = "participated";
    else if (rawPos.includes("1")) position = "1st";
    else if (rawPos.includes("2")) position = "2nd";
    else if (rawPos.includes("3")) position = "3rd";
    else if (rawPos === "pending") position = "pending";

    // detect level
    let level = "institute";
    if (/international/i.test(sport)) level = "international";
    else if (/national|inter\s*university/i.test(sport)) level = "national";
    else if (/state|inter\s*college|ptu|university/i.test(sport)) level = "state";

    // ✅ logic for pending
    if (position === "pending") {
      // check if this student has a valid position for the same sport
      const hasValidPos = student.positions?.some(
        (p) =>
          p &&
          !/pending/i.test(p) &&
          !/^\s*$/.test(p) // not empty
      );

      if (hasValidPos) {
        return; // ignore pending if valid exists
      }

      // if only pending → always 0 (no marks)
      return;
    }

    // normal scoring
    const value = multipliers[level][position] || 0;
    total += value;
  });

  // captain bonus
  if (student.isCaptain) total += 15;

  // gym/swimming/shooting bonus
  if (student.sports.some((s) => /gym|swimming|shooting/i.test(s))) {
    total += 30;
  }

  return total;
};


  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Students (URN Unique)</h1>

      {/* Session Dropdown */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Select Session (Full Year)
        </label>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="">-- Select Session --</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.session}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">URN</th>
            <th className="border px-2 py-1">Branch</th>
            <th className="border px-2 py-1">Year</th>
            <th className="border px-2 py-1">Sports</th>
            <th className="border px-2 py-1">Positions</th>
            <th className="border px-2 py-1">Score</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={s.urn}>
              <td className="border px-2 py-1">{i + 1}</td>
              <td className="border px-2 py-1">{s.name}</td>
              <td className="border px-2 py-1">{s.urn}</td>
              <td className="border px-2 py-1">{s.branch}</td>
              <td className="border px-2 py-1">{s.year}</td>
              <td className="border px-2 py-1">{s.sports.join(", ")}</td>
              <td className="border px-2 py-1">{s.positions.join(", ")}</td>
              <td className="border px-2 py-1">{getScore(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
