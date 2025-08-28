import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

const fetchDetails = async () => {
  try {
    const res = await API.get(`/admin/student/${id}`, { withCredentials: true });
    setStudent(res.data);

    // ✅ photo & signaturePhoto ke liye fallback empty string
    setForm({
      ...res.data,
      photo: res.data.photo || "",
      signaturePhoto: res.data.signaturePhoto || "",
    });
  } catch (err) {
    console.error(err);
    alert("Failed to fetch student details");
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await API.delete(`/admin/student/${id}`, { withCredentials: true });
      alert("Deleted successfully");
      navigate("/admin/students");
    } catch (err) {
      console.error(err);
      alert("Failed to delete student");
    }
  };
const handleUpdate = async () => {
  try {
    const formData = new FormData();

    // ✅ Append all normal fields (except file fields)
    for (const key in form) {
      if (
        form[key] !== undefined &&
        form[key] !== null &&
        key !== "photo" &&
        key !== "signaturePhoto"
      ) {
          if (key === "userId" && typeof form[key] === "object" && form[key]._id) {
          formData.append("userId", form[key]._id);
        } else {
          formData.append(key, form[key]);
        }
      }
    }

    // ✅ Append file fields separately
    if (form.photo instanceof File) {
      formData.append("photo", form.photo);
    }
    if (form.signaturePhoto instanceof File) {
      formData.append("signaturePhoto", form.signaturePhoto);
    }

    const res = await API.put(`/admin/student/${id}`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    setStudent(res.data);
    setEditing(false);
    alert("Student updated successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to update student");
  }
};


  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!student) return <p className="text-center">No details found</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="p-6">
      <Link to="/admin/students" className="text-blue-600 underline mb-4 inline-block">
        ← Back to Students
      </Link>

      <div className="max-w-3xl mx-auto border p-6 rounded shadow bg-white">
        {!editing ? (
          <>
            <h2 className="text-2xl font-bold mb-4">{student.name}</h2>
            <img src={student.photo} alt="student" className="w-32 h-32 object-cover mb-4" />
              <img src={student.signaturePhoto} alt="student" className="w-32 h-32 object-cover mb-4" />
            <p><strong>Passowrd:</strong>{student.userId.password}</p>
            <p><strong>Email:</strong> {student.userId?.email}</p>
            <p><strong>URN:</strong> {student.urn}</p>
            <p><strong>CRN:</strong> {student.crn}</p>
            <p><strong>Branch:</strong> {student.branch}</p>
            <p><strong>Year:</strong> {student.year}</p>
            <p><strong>DOB:</strong> {student.dob ? new Date(student.dob).toLocaleDateString() : "-"}</p>
            <p><strong>Gender:</strong> {student.gender}</p>
            <p><strong>Contact:</strong> {student.contact}</p>
            <p><strong>Address:</strong> {student.address}</p>
            <p><strong>Father Name:</strong> {student.fatherName}</p>
            <p><strong>Matric Passing Year:</strong> {student.yearOfPassingMatric}</p>
            <p><strong>+2 Passing Year:</strong> {student.yearOfPassingPlusTwo}</p>
            <p><strong>First Admission Date:</strong> {student.firstAdmissionDate}</p>
            <p><strong>Last Exam Name:</strong> {student.lastExamName}</p>
            <p><strong>Last Exam Year:</strong> {student.lastExamYear}</p>
            <p><strong>Years of Participation:</strong> {student.yearsOfParticipation}</p>
            <p><strong>Sports:</strong> {student.sports?.join(", ")}</p>
            <p><strong>Status (Personal):</strong> {student.status?.personal}</p>
            <p><strong>Status (Sports):</strong> {student.status?.sports}</p>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
            <div className="grid grid-cols-2 gap-4">
              <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" className="border p-2" />
              <input name="urn" value={form.urn || ""} onChange={handleChange} placeholder="URN" className="border p-2" />
              <input name="crn" value={form.crn || ""} onChange={handleChange} placeholder="CRN" className="border p-2" />
              <input name="branch" value={form.branch || ""} onChange={handleChange} placeholder="Branch" className="border p-2" />
              <input name="year" type="number" value={form.year || ""} onChange={handleChange} placeholder="Year" className="border p-2" />
                {/* 🔹 New password field */}
  <input
    name="password"
    type="password"
    value={form.password || ""}
    onChange={handleChange}
    placeholder="Password"
    className="border p-2"
  />
              <input name="dob" type="date" value={form.dob ? form.dob.substring(0, 10) : ""} onChange={handleChange} className="border p-2" />
              <input name="gender" value={form.gender || ""} onChange={handleChange} placeholder="Gender" className="border p-2" />
              <input name="contact" value={form.contact || ""} onChange={handleChange} placeholder="Contact" className="border p-2" />
              <input name="address" value={form.address || ""} onChange={handleChange} placeholder="Address" className="border p-2" />
              <input name="fatherName" value={form.fatherName || ""} onChange={handleChange} placeholder="Father Name" className="border p-2" />
              <input name="yearOfPassingMatric" type="number" value={form.yearOfPassingMatric || ""} onChange={handleChange} placeholder="Matric Year" className="border p-2" />
              <input name="yearOfPassingPlusTwo" type="number" value={form.yearOfPassingPlusTwo || ""} onChange={handleChange} placeholder="+2 Year" className="border p-2" />
              <input name="firstAdmissionDate" type="month" value={form.firstAdmissionDate || ""} onChange={handleChange} className="border p-2" />
              <input name="lastExamName" value={form.lastExamName || ""} onChange={handleChange} placeholder="Last Exam Name" className="border p-2" />
              <input name="lastExamYear" type="number" value={form.lastExamYear || ""} onChange={handleChange} placeholder="Last Exam Year" className="border p-2" />
              <input name="yearsOfParticipation" type="number" value={form.yearsOfParticipation || ""} onChange={handleChange} placeholder="Participation Years" className="border p-2" />
              <input name="sports" value={form.sports?.join(", ") || ""} onChange={(e) => setForm({ ...form, sports: e.target.value.split(",") })} placeholder="Sports (comma separated)" className="border p-2" />
              <select name="status.personal" value={form.status?.personal || "none"} onChange={(e) => setForm({ ...form, status: { ...form.status, personal: e.target.value } })} className="border p-2">
                <option value="none">Personal - None</option>
                <option value="pending">Personal - Pending</option>
                <option value="approved">Personal - Approved</option>
              </select>
              <select name="status.sports" value={form.status?.sports || "none"} onChange={(e) => setForm({ ...form, status: { ...form.status, sports: e.target.value } })} className="border p-2">
                <option value="none">Sports - None</option>
                <option value="pending">Sports - Pending</option>
                <option value="approved">Sports - Approved</option>
              </select>
            </div>
{/* Photo Upload */}
<div>
  <label>Photo</label>
  <input
    type="file"
    name="photo"
    accept="image/*"
    onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
  />
  {/* Show preview if already uploaded */}
  {form.photo && typeof form.photo === "string" && (
    <img src={form.photo} alt="photo" width={100} />
  )}
</div>

{/* Signature Upload */}
<div>
  <label>Signature</label>
  <input
    type="file"
    name="signaturePhoto"
    accept="image/*"
    onChange={(e) => setForm({ ...form, signaturePhoto: e.target.files[0] })}
  />
  {form.signaturePhoto && typeof form.signaturePhoto === "string" && (
    <img src={form.signaturePhoto} alt="signature" width={100} />
  )}
</div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
