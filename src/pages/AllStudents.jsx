import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/admin/students", { withCredentials: true });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Students</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">URN</th>
            <th className="border p-2">CRN</th>
            <th className="border p-2">Branch</th>
            <th className="border p-2">Year</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">{s.urn}</td>
              <td className="border p-2">{s.crn}</td>
              <td className="border p-2">{s.branch}</td>
              <td className="border p-2">{s.year}</td>
              <td className="border p-2">
                <Link
                  to={`/admin/student/${s._id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View / Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllStudents;
