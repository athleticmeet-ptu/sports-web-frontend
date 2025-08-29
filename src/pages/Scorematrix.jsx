import { useEffect, useState } from "react";
import API from "../services/api";

const months = [
  { short: "Jan", full: "January" },
  { short: "Feb", full: "February" },
  { short: "Mar", full: "March" },
  { short: "Apr", full: "April" },
  { short: "May", full: "May" },
  { short: "Jun", full: "June" },
  { short: "July", full: "July" },
  { short: "Aug", full: "August" },
  { short: "Sep", full: "September" },
  { short: "Oct", full: "October" },
  { short: "Nov", full: "November" },
  { short: "Dec", full: "December" },
];

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [startMonth, setStartMonth] = useState("Jan");
  const [endMonth, setEndMonth] = useState("Dec");
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);

  // 🔹 Fetch all sessions
  useEffect(() => {
    API.get("/session")
      .then((res) => {
        if (!res.data) return;

        setSessions(res.data);

        const yr = new Set();
        res.data.forEach((s) => {
          if (s.startDate) yr.add(new Date(s.startDate).getFullYear());
          if (s.endDate) yr.add(new Date(s.endDate).getFullYear());
        });

        setYears(Array.from(yr).sort());
      })
      .catch((err) => console.error("Error fetching sessions:", err));
  }, []);

  // 🔹 Fetch students whenever range changes
  useEffect(() => {
    if (!startYear || !endYear || !startMonth || !endMonth) return;

    // Build session string to send to backend
    let sessionString = `${startMonth}–${endMonth} ${endYear}`;

    if (startYear !== endYear) {
      sessionString = `${startMonth} ${startYear}–${endMonth} ${endYear}`;
    }

    API.get("/admin/students-unique", {
      params: { session: sessionString },
    })
      .then((res) => setStudents(res.data || []))
      .catch((err) => console.error("Error fetching students:", err));
  }, [startMonth, endMonth, startYear, endYear]);

  // 🔹 Score Calculation (unchanged)
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
      let position = "";
      if (["participation", "participated"].includes(rawPos)) position = "participated";
      else if (rawPos.includes("1")) position = "1st";
      else if (rawPos.includes("2")) position = "2nd";
      else if (rawPos.includes("3")) position = "3rd";
      else if (rawPos === "pending") position = "pending";

      let level = "institute";
      if (/international/i.test(sport)) level = "international";
      else if (/national|inter\s*university/i.test(sport)) level = "national";
      else if (/state|inter\s*college|ptu|university/i.test(sport)) level = "state";

      if (position === "pending") {
        const hasValidPos = student.positions?.some(
          (p) => p && !/pending/i.test(p) && !/^\s*$/.test(p)
        );
        if (hasValidPos) return;
        return;
      }

      const value = multipliers[level][position] || 0;
      total += value;
    });

    if (student.isCaptain) total += 15;
    if (student.sports.some((s) => /gym|swimming|shooting/i.test(s))) {
      total += 30;
    }

    return total;
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Students (URN Unique)</h1>

      {/* 🔹 Session Picker */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block font-medium mb-1">Start Month</label>
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            {months.map((m) => (
              <option key={m.short} value={m.short}>{m.short}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Start Year</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="border px-3 py-2 rounded-md"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">End Month</label>
          <select
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            {months.map((m) => (
              <option key={m.short} value={m.short}>{m.short}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">End Year</label>
          <select
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            className="border px-3 py-2 rounded-md"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
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
