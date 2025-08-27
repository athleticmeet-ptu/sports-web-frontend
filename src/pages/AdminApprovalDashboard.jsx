import { useEffect, useState } from "react";
import API from "../services/api";

const AdminApprovalDashboard = () => {
  const [pendingTeams, setPendingTeams] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Fetch all pending data at once
  const fetchAllData = async () => {
    try {
      setError("");
      setLoading(true);

      const [teamsRes, studentsRes, captainsRes] = await Promise.all([
        API.get("/admin/pending-teams", { withCredentials: true }),
        API.get("/admin/pending-profiles", { withCredentials: true }),
        API.get("/admin/captains", { withCredentials: true }),
      ]);

      setPendingTeams(teamsRes.data || []);
      setPendingStudents(studentsRes.data || []);
      setCaptains(captainsRes.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ✅ Update student status
  const updateStudentStatus = async (studentId, type, status) => {
    try {
      if (status === "approved") {
        await API.put(
          `/admin/student/${studentId}/approve?type=${type}`,
          {},
          { withCredentials: true }
        );
      } else {
        await API.delete(
          `/admin/student/${studentId}/reject?type=${type}`,
          { withCredentials: true }
        );
      }

      setPendingStudents((prev) =>
        prev.filter(
          (s) =>
            !(
              s._id === studentId &&
              ((type === "personal" && s.pendingPersonal) ||
                (type === "sports" && s.pendingSports))
            )
        )
      );
      alert(`✅ Student ${type} ${status} successfully!`);
    } catch (err) {
      console.error(`Error updating student ${type}`, err);
      alert(`❌ Failed to ${status} student ${type}.`);
    }
  };

  // ✅ Update team status
  const updateTeamStatus = async (teamId, status) => {
    try {
      await API.put(
        `/admin/team/${teamId}/status`,
        { status },
        { withCredentials: true }
      );
      setPendingTeams((prev) => prev.filter((team) => team._id !== teamId));
      alert(`✅ Team ${status} successfully!`);
    } catch (err) {
      console.error("Error updating team status", err);
      alert(`❌ Failed to ${status} team.`);
    }
  };

  if (loading) return <p className="p-6">Loading pending approvals...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Approvals</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* 🔹 Pending Students */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Pending Student Profiles</h2>
        {pendingStudents.length === 0 ? (
          <p className="text-gray-500">No pending student profiles.</p>
        ) : (
          <div className="space-y-4">
            {pendingStudents.map((student) => (
              <div
                key={student._id}
                className="border rounded shadow p-4 bg-white"
              >
                <div className="flex justify-between">
                  <div>
                    {student.photo && (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-24 h-24 object-cover rounded mb-2 border"
                      />
                    )}
                    {student.signaturePhoto && (
                      <img
                        src={student.signaturePhoto}
                        alt="Signature"
                        className="w-24 h-12 object-contain rounded mb-2 border"
                      />
                    )}
  <p><strong>Name:</strong> {student.name || "N/A"}</p>
  <p><strong>Email:</strong> {student.email || "N/A"}</p>
  <p><strong>URN:</strong> {student.urn || "N/A"}</p>
  <p><strong>CRN:</strong> {student.crn || "N/A"}</p>
  <p><strong>Branch:</strong> {student.branch || "N/A"}</p>
  <p><strong>Year:</strong> {student.year || "N/A"}</p>
  <p><strong>DOB:</strong> {student.dob || "N/A"}</p>
  <p><strong>Gender:</strong> {student.gender || "N/A"}</p>
  <p><strong>Address:</strong> {student.address || "N/A"}</p>
  <p><strong>Phone:</strong> {student.phone || "N/A"}</p>
  <p><strong>Father's Name:</strong> {student.fatherName || "N/A"}</p>
  <p><strong>Year of Passing (Matric):</strong> {student.yearOfPassingMatric || "N/A"}</p>
  <p><strong>Year of Passing (Plus Two):</strong> {student.yearOfPassingPlusTwo || "N/A"}</p>
  <p><strong>Years of Participation:</strong> {student.yearsOfParticipation || 0}</p>
  <p><strong>First Admission Date:</strong> {student.firstAdmissionDate || "N/A"}</p>
  <p><strong>Last Exam Name:</strong> {student.lastExamName || "N/A"}</p>
  <p><strong>Last Exam Year:</strong> {student.lastExamYear || "N/A"}</p>
  <p><strong>Inter College Graduate Course:</strong> {student.interCollegeGraduateCourse }</p>
  <p><strong>Inter College PG Years:</strong> {student.interCollegePgCourse}</p>

                    <p>
                      <strong>Sports:</strong>{" "}
                      {student.sports?.length > 0
                        ? student.sports.join(", ")
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Pending Personal:</strong>{" "}
                      {student.pendingPersonal ? "Yes" : "No"} |{" "}
                      <strong>Pending Sports:</strong>{" "}
                      {student.pendingSports ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {student.pendingPersonal && (
                      <div className="space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded"
                          onClick={() =>
                            updateStudentStatus(
                              student._id,
                              "personal",
                              "approved"
                            )
                          }
                        >
                          Approve Personal
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded"
                          onClick={() =>
                            updateStudentStatus(
                              student._id,
                              "personal",
                              "rejected"
                            )
                          }
                        >
                          Reject Personal
                        </button>
                      </div>
                    )}
                    {student.pendingSports && (
                      <div className="space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded"
                          onClick={() =>
                            updateStudentStatus(
                              student._id,
                              "sports",
                              "approved"
                            )
                          }
                        >
                          Approve Sports
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded"
                          onClick={() =>
                            updateStudentStatus(
                              student._id,
                              "sports",
                              "rejected"
                            )
                          }
                        >
                          Reject Sports
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔹 Pending Teams */}
<section className="mb-10">
  <h2 className="text-xl font-semibold mb-3">Pending Teams</h2>
  {pendingTeams.length === 0 ? (
    <p className="text-gray-500">No pending teams for approval.</p>
  ) : (
    <div className="overflow-x-auto">
      {pendingTeams.map((team) => {
        // Captain info captains API से निकालना
        const captain = captains.find((c) => c.captainId === team.captainId);

        return (
          <div
            key={team._id}
            className="mb-6 border rounded shadow p-4 bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">
                  {captain?.teamName || "Unnamed Team"}
                </h2>
                <p>
                  <strong>Sport:</strong> {captain?.sport || "N/A"}
                </p>
                <p>
                  <strong>Captain:</strong> {captain?.name || "Unknown"}
                </p>
                <p>
                  <strong>Status:</strong> {team.status?.toUpperCase()}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => updateTeamStatus(team._id, "approved")}
                >
                  Approve
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => updateTeamStatus(team._id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>

            {team.members?.length > 0 ? (
              <table className="table-auto w-full border-collapse border border-gray-300 mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">#</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">URN</th>
                    <th className="border px-2 py-1">Branch</th>
                    <th className="border px-2 py-1">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map((m, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{i + 1}</td>
                      <td className="border px-2 py-1">{m.name}</td>
                      <td className="border px-2 py-1">{m.urn}</td>
                      <td className="border px-2 py-1">{m.branch}</td>
                      <td className="border px-2 py-1">{m.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 mt-2">No members listed</p>
            )}
          </div>
        );
      })}
    </div>
  )}
</section>



    </div>
  );
};

export default AdminApprovalDashboard;
