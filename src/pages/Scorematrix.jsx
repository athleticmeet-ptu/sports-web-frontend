import { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Selected sessions
  const [selectedSession1, setSelectedSession1] = useState("");
  const [selectedSession2, setSelectedSession2] = useState("");

  // 🔹 Fetch all sessions from backend
  useEffect(() => {
    API.get("/session")
      .then((res) => {
        if (!res.data) return;
        setSessions(res.data);
      })
      .catch((err) => console.error("Error fetching sessions:", err));
  }, []);

  // 🔹 Fetch students when either session changes
  useEffect(() => {
    if (!selectedSession1 && !selectedSession2) return;

    const fetchStudents = async () => {
      try {
        const promises = [];
        if (selectedSession1)
          promises.push(
            API.get("/admin/students-unique", { params: { sessionId: selectedSession1 } })
          );
        if (selectedSession2)
          promises.push(
            API.get("/admin/students-unique", { params: { sessionId: selectedSession2 } })
          );

        const results = await Promise.all(promises);

        // Merge students by URN to avoid duplicates and merge sports/positions
        const merged = {};
        results.forEach((res) => {
          (res.data || []).forEach((s) => {
            if (!merged[s.urn]) {
              merged[s.urn] = { ...s };
              // Ensure arrays
              merged[s.urn].sports = Array.isArray(s.sports) ? [...s.sports] : s.sports ? [s.sports] : [];
              merged[s.urn].positions = Array.isArray(s.positions)
                ? [...s.positions]
                : s.positions
                ? [s.positions]
                : [];
            } else {
              // Merge sports & positions
              if (Array.isArray(s.sports)) merged[s.urn].sports.push(...s.sports);
              else if (s.sports) merged[s.urn].sports.push(s.sports);

              if (Array.isArray(s.positions)) merged[s.urn].positions.push(...s.positions);
              else if (s.positions) merged[s.urn].positions.push(s.positions);

              // Optional: remove duplicates
              merged[s.urn].sports = [...new Set(merged[s.urn].sports)];
              merged[s.urn].positions = [...new Set(merged[s.urn].positions)];
            }
          });
        });

        setStudents(Object.values(merged));
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [selectedSession1, selectedSession2]);

  // 🔹 Score Calculation
  const getScore = (student) => {
  let total = 0;
  const multipliers = {
    international: { "1st": 60, "2nd": 58, "3rd": 56, participated: 55 },
    national: { "1st": 55, "2nd": 53, "3rd": 51, participated: 50 },
    state: { "1st": 50, "2nd": 48, "3rd": 46, participated: 45 },
    institute: { "1st": 45, "2nd": 43, "3rd": 41, participated: 15 },
  };

  const sportsArr = Array.isArray(student.sports) ? student.sports : [];
  const posArr = Array.isArray(student.positions) ? student.positions : [];

  for (let i = 0; i < sportsArr.length; i++) {
    const sport = sportsArr[i];
    const posValue = posArr[i];

    // 🔹 Handle both string or object
    let rawPos = "";
    if (typeof posValue === "string") rawPos = posValue.toLowerCase();
    else if (posValue && typeof posValue === "object") rawPos = (posValue.position || "").toLowerCase();

    let position = "";
    if (["participation", "participated"].includes(rawPos)) position = "participated";
    else if (rawPos.includes("1")) position = "1st";
    else if (rawPos.includes("2")) position = "2nd";
    else if (rawPos.includes("3")) position = "3rd";
    else if (rawPos === "pending") position = "pending";

    let level = "institute";
    if (typeof sport === "string") {
      if (/international/i.test(sport)) level = "international";
      else if (/national|inter\s*university/i.test(sport)) level = "national";
      else if (/state|inter\s*college|ptu|university/i.test(sport)) level = "state";
    }

    if (position === "pending") {
      const hasValidPos = posArr.some((p) => {
        if (typeof p === "string") return p && !/pending/i.test(p) && !/^\s*$/.test(p);
        else if (p && typeof p === "object") return p.position && !/pending/i.test(p.position) && !/^\s*$/.test(p.position);
        return false;
      });
      if (!hasValidPos) continue;
      position = "participated"; // fallback
    }

    total += multipliers[level][position] || 0;
  }

  if (student.isCaptain) total += 15;
  if (sportsArr.some((s) => typeof s === "string" && /gym|swimming|shooting/i.test(s))) total += 30;

  return total;
};


  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Students (Merged Sessions)</h1>

      {/* 🔹 Two Session Selectors */}
      <div className="flex gap-6 mb-4">
        {[1, 2].map((num) => (
          <div key={num}>
            <label className="block font-medium mb-1">Session {num}</label>
            <select
              value={num === 1 ? selectedSession1 : selectedSession2}
              onChange={(e) =>
                num === 1
                  ? setSelectedSession1(e.target.value)
                  : setSelectedSession2(e.target.value)
              }
              className="border px-3 py-2 rounded-md"
            >
              <option value="">Select Session</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {new Date(s.startDate).toLocaleString("default", { month: "short" })}–
                  {new Date(s.endDate).toLocaleString("default", { month: "short" })}{" "}
                  {new Date(s.endDate).getFullYear()}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* 🔹 Students Table */}
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
              <td className="border px-2 py-1">{Array.isArray(s.sports) ? s.sports.join(", ") : ""}</td>
              <td className="border px-2 py-1">
  {Array.isArray(s.positions)
    ? s.positions
        .map((p) =>
          typeof p === "string" ? p : `${p.sport} (${p.position || "pending"})`
        )
        .join(", ")
    : ""}
</td>

              <td className="border px-2 py-1">{getScore(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
