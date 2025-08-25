import { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    API.get("/admin/students-unique")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Students (URN Unique)</h1>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}