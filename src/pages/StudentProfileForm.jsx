// src/components/StudentProfileForm.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

const StudentProfileForm = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSessionIsActive, setSelectedSessionIsActive] = useState(false);
  const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState(null); // 🔥 Added
  const [loadingHistory, setLoadingHistory] = useState(false); // 🔥 Added
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    contact: "",
    address: "",
    sports: [],
    crn: "",
    photo: "",
    fatherName: "",
    yearOfPassingMatric: "",
    yearOfPassingPlusTwo: "",
    firstAdmissionDate: "",
    lastExamName: "",
    lastExamYear: "",
    yearsOfParticipation: "",
    signaturePhoto: "",
    interCollegeGraduateCourse:"",   // ✅ NEW
    interCollegePgCourse:""
  });

  const [adminSports, setAdminSports] = useState([]);
  const [newSport, setNewSport] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingForApproval, setSubmittingForApproval] = useState(false);
  const [sportsSubmitting, setSportsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  // fetch sessions
  const fetchSessions = async () => {
    try {
      const res = await API.get("/student/my-sessions", {
        withCredentials: true,
      });
      const sessionList = res.data || [];
      setSessions(sessionList);
      if (sessionList.length > 0) {
        const activeSession = sessionList.find((s) => s.isActive);
        if (activeSession) {
          setSelectedSession(activeSession._id);
          setSelectedSessionIsActive(true);
        } else {
          setSelectedSession(sessionList[0]._id);
          setSelectedSessionIsActive(sessionList[0].isActive);
        }
      }
    } catch {
      setErr("Failed to load sessions.");
    }
  };
  const fetchHistory = async (urn) => {
    setLoadingHistory(true);
    try {
      const res = await API.get(`/student/history/${urn}`, { withCredentials: true });
      setHistory(res.data);
    } catch {
      setHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };
  // fetch profile
  const fetchProfile = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await API.get(`/student/profile?sessionId=${sessionId}`, {
        withCredentials: true,
      });
      const data = res.data;
      setProfile(data);
          if (data?.urn) {
      fetchHistory(data.urn);
    }
      const adminSportList = data?.sports || [];
      setAdminSports(adminSportList);

      setFormData({
        dob: data?.dob ? data.dob.slice(0, 10) : "",
        gender: data?.gender || "",
        contact: data?.contact || "",
        address: data?.address || "",
        crn: data?.crn || "",
        photo: data?.photo || "",
        fatherName: data?.fatherName || "",
        yearOfPassingMatric: data?.yearOfPassingMatric || "",
        yearOfPassingPlusTwo: data?.yearOfPassingPlusTwo || "",
        firstAdmissionDate: data?.firstAdmissionDate || "",
        lastExamName: data?.lastExamName || "",
        lastExamYear: data?.lastExamYear || "",
        yearsOfParticipation: data?.yearsOfParticipation || "",
        signaturePhoto: data?.signaturePhoto || "",
        sports: Array.from(new Set([...(data?.studentSports || [])])),
        interCollegeGraduateCourse: data?.interCollegeGraduateCourse || 0, // ✅ NEW
        interCollegePgCourse: data?.interCollegePgCourse || 0,   
      });
      if (data?.isCloned) {
      alert("This profile has been cloned from your last approved session. Please review and update if needed.");
    }
      const sessionInfo = sessions.find((s) => s._id === sessionId);
      setSelectedSessionIsActive(sessionInfo?.isActive || false);
    } catch {
      setErr("Failed to load profile.");
    } finally {
      setLoading(false);
      
    }
  };

  // input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // upload handler (separate inputs for photo & signature)
  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const data = new FormData();
      data.append(type, file);

      const res = await API.post(`/student/upload-photo`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data[type]) {
        setFormData((prev) => ({ ...prev, [type]: res.data[type] }));
        alert(`✅ ${type} uploaded successfully`);
      }
    } catch {
      setErr("❌ Upload error");
    } finally {
      setUploading(false);
    }
  };

  // save personal
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      await API.put(
        "/student/profile",
        {
          sessionId: selectedSession,
          ...formData,
        },
        { withCredentials: true }
      );

      alert("✅ Personal details saved successfully.");
      fetchProfile(selectedSession);
    } catch {
      setErr("❌ Failed to save personal details.");
    } finally {
      setSubmitting(false);
    }
  };

  // submit for approval
  const handleSubmitPersonalForApproval = async () => {
    setSubmittingForApproval(true);
    setErr("");
    try {
      await API.post(
        "/student/submit-profile",
        {
          sessionId: selectedSession,
          ...formData,
        },
        { withCredentials: true }
      );
setProfile((prev) => ({
  ...prev,
  status: { ...prev?.status, personal: "pending" }
}));
      alert("✅ Personal details submitted for approval.");
      fetchProfile(selectedSession);
    } catch {
      setErr("❌ Failed to submit personal details for approval.");
    } finally {
      setSubmittingForApproval(false);
    }
  };

  // add sport
  const handleAddSport = () => {
    if (!newSport.trim()) return;
    const prefixed = newSport.startsWith("PTU Intercollege ")
      ? newSport
      : `PTU Intercollege ${newSport}`;
    if (!formData.sports.includes(prefixed)) {
      setFormData((prev) => ({ ...prev, sports: [...prev.sports, prefixed] }));
    }
    setNewSport("");
  };

  // remove sport
  const handleRemoveSport = (sport) => {
    if (adminSports.includes(sport)) return;
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((s) => s !== sport),
    }));
  };

  // submit sports
  const handleSubmitSports = async () => {
    if (!formData.sports.length) return;
    setSportsSubmitting(true);
    setErr("");
    try {
      await API.post(
        "/student/submit-profile",
        {
          sessionId: selectedSession,
          sports: formData.sports,
        },
        { withCredentials: true }
      );

      alert("✅ Sports submitted for approval.");
      fetchProfile(selectedSession);
          setProfile((prev) => ({
      ...prev,
      status: { ...prev.status, sports: "pending" },
    }));
    
    } catch {
      setErr("❌ Failed to submit sports.");
    } finally {
      setSportsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);
  useEffect(() => {
    if (selectedSession) fetchProfile(selectedSession);
  }, [selectedSession]);

  if (loading && !profile) return <p className="text-center">Loading...</p>;

 
// ---- Personal states ----
const personalPending = profile?.status?.personal === "pending";
const personalApproved = profile?.status?.personal === "approved";

// ---- Sports states ----
const sportsPending = profile?.status?.sports === "pending";
const sportsApproved = profile?.status?.sports === "approved";

// ---- Disable conditions ----
const readOnlyPersonal =
  !selectedSessionIsActive || personalPending || personalApproved;

const disableSports =
  !personalApproved || sportsPending || sportsApproved;







return (
  <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
    <h2 className="text-2xl font-bold mb-4">Student Profile</h2>
{!selectedSessionIsActive && (
  <p className="text-red-600 font-semibold mb-4">
    ⚠️ This session has expired. You cannot update details.
  </p>
)}
    {/* ---- Status Messages ---- */}
    {personalApproved && (
      <p className="text-green-600 font-semibold mb-4">
        ✅ Personal details approved
      </p>
    )}
    {personalPending && !personalApproved && (
      <p className="text-amber-600 font-semibold mb-4">
        ⏳ Personal details pending approval
      </p>
    )}
    {err && <p className="text-red-500 mb-2">{err}</p>}

    {/* ---- Session Select ---- */}
    <div className="mb-4">
      <label className="block mb-1 font-semibold">Select Session</label>
      <select
        value={selectedSession}
        onChange={(e) => setSelectedSession(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">-- Select Session --</option>
        {sessions.map((s) => (
          <option key={s._id} value={s._id}>
            {s.session} {s.isActive ? "(Active)" : ""}
          </option>
        ))}
      </select>
    </div>

    {/* ---- Personal Details ---- */}
    {profile && (
      <>
        {!personalApproved ? (
          <form className="space-y-4 mb-4">
            {/* Inputs */}
            <input
              name="crn"
              placeholder="CRN"
              value={formData.crn}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending || profile?.isCloned}
            />

            <input
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending|| profile?.isCloned}
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending|| profile?.isCloned}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <input
              name="fatherName"
              placeholder="Father's Name"
              value={formData.fatherName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending|| profile?.isCloned}
            />

            <input
              type="text"
              name="yearOfPassingMatric"
              value={formData.yearOfPassingMatric}
              onChange={handleChange}
              disabled={personalPending|| profile?.isCloned}
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              name="yearOfPassingPlusTwo"
              value={formData.yearOfPassingPlusTwo}
              onChange={handleChange}
              disabled={personalPending|| profile?.isCloned}
              className="w-full border p-2 rounded"
            />

            <input
              name="firstAdmissionDate"
              type="month"
              value={formData.firstAdmissionDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending|| profile?.isCloned}
            />

            <input
              name="lastExamName"
              placeholder="Name of Last Exam Passed"
              value={formData.lastExamName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending}
            />

            <input
              name="lastExamYear"
              placeholder="Year of Last Exam Passed"
              value={formData.lastExamYear}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending}
            />

            <input
              type="number"
              name="yearsOfParticipation"
              value={formData.yearsOfParticipation}
              onChange={handleChange}
              disabled={personalPending}
              className="w-full border p-2 rounded"
            />

            <input
              name="contact"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={personalPending|| profile?.isCloned}
            />
            <input
                type="number"
                name="interCollegeGraduateCourse"
                value={formData.interCollegeGraduateCourse}
                onChange={handleChange}
                placeholder="Inter-College Graduate Course Count"
                disabled={personalPending|| profile?.isCloned}
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                name="interCollegePgCourse"
                value={formData.interCollegePgCourse}
                onChange={handleChange}
                placeholder="Inter-College PG Course Count"
                disabled={personalPending|| profile?.isCloned}
                className="w-full border p-2 rounded"
              />
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange|| profile?.isCloned}
              className="w-full border p-2 rounded"
              disabled={personalPending}
            />

            {/* Uploads */}
            <div>
              <label className="block mb-1 font-semibold">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "photo")}
                disabled={personalPending || uploading|| profile?.isCloned}
              />
              {formData.photo && (
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded mt-2"
                />
              )}
            </div>

            <div>
              <label className="block mb-1 font-semibold">
                Upload Signature
              </label>
              <input
                name="signaturePhoto"
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, "signaturePhoto")}
                disabled={personalPending || uploading|| profile?.isCloned}
              />
              {formData.signaturePhoto && (
                <img
                  src={formData.signaturePhoto}
                  alt="Signature"
                  className="w-24 h-12 object-contain mt-2 border"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSavePersonal}
                disabled={personalPending || submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                {submitting ? "Saving..." : "Save Personal Details"}
              </button>
              <button
                type="button"
                onClick={handleSubmitPersonalForApproval}
                disabled={
                  personalPending || personalApproved || submittingForApproval
                }
                className={`py-2 px-4 rounded text-white ${
                  personalPending || personalApproved || submittingForApproval
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {submittingForApproval
                  ? "Submitting..."
                  : "Submit for Approval"}
              </button>
            </div>
          </form>
        ) : (
          // Case 2: Approved → Show readonly
          <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded">
            <p><strong>CRN:</strong> {formData.crn}</p>
            <p><strong>Father's Name:</strong> {formData.fatherName}</p>
            <p><strong>DOB:</strong> {formData.dob}</p>
            <p><strong>Gender:</strong> {formData.gender}</p>
            <p><strong>Matric Year:</strong> {formData.yearOfPassingMatric}</p>
            <p><strong>+2 Year:</strong> {formData.yearOfPassingPlusTwo}</p>
            <p><strong>First Admission:</strong> {formData.firstAdmissionDate}</p>
            <p>
              <strong>Last Exam:</strong> {formData.lastExamName} (
              {formData.lastExamYear})
            </p>
            <p>
              <strong>Participation Years:</strong>{" "}
              {formData.yearsOfParticipation}
            </p>
            <p><strong>Contact:</strong> {formData.contact}</p>
            <p><strong>Address:</strong> {formData.address}</p>
            {formData.photo && (
              <img
                src={formData.photo}
                alt="Profile"
                className="w-24 h-24 object-cover rounded"
              />
            )}
            {formData.signaturePhoto && (
              <img
                src={formData.signaturePhoto}
                alt="Signature"
                className="w-24 h-12 object-contain border"
              />
            )}
          </div>
        )}

        {/* ---- Sports ---- */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Sports</label>

          {!personalApproved && (
            <p className="text-sm text-gray-500">
              ⚠️ Sports can be added only after personal details are approved.
            </p>
          )}

          {sportsApproved && (
            <div className="flex flex-wrap gap-2">
              
              {profile.sports.map((sport, idx) => (
                <span
                  key={idx}
                  className="bg-green-200 px-3 py-1 rounded-full"
                >
                  {sport}
                </span>
              ))}
              <p>Sports approved too!!!!</p>
            </div>
          )}
          <label className="block mb-1 font-semibold">Sports & Positions</label>

  {profile?.positions?.length > 0 && (
    <div className="space-y-2 mb-3">
      <h3 className="font-semibold text-green-700">🏆 Achievements</h3>
      <ul className="list-disc list-inside text-gray-700">
        {profile.positions.map((p, idx) => (
          <li key={idx}>
            {p.sport} - <span className="font-bold">{p.position}</span>
          </li>
        ))}
      </ul>
    </div>
  )}
          {personalApproved && !sportsApproved && (
            <>
              {sportsPending && (
                <p className="text-sm text-amber-700 mt-2">
                  ⏳ Sports pending admin approval…
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  ...adminSports,
                  ...formData.sports.filter((s) => !adminSports.includes(s)),
                ].map((sport, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 px-3 py-1 rounded-full flex items-center space-x-2"
                  >
                    <span>{sport}</span>
                    {!adminSports.includes(sport) && !sportsPending && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSport(sport)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <div className="flex space-x-2 mt-2">
                <input
                  type="text"
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  placeholder="Enter sport"
                  className="border p-2 rounded flex-1"
                  disabled={sportsPending}
                />
                <button
                  type="button"
                  onClick={handleAddSport}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={sportsPending}
                >
                  +
                </button>
              </div>

              {formData.sports.length > 0 && (
                <button
                  type="button"
                  onClick={handleSubmitSports}
                  disabled={sportsPending || sportsSubmitting}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  {sportsSubmitting
                    ? "Submitting..."
                    : "Submit Sports for Approval"}
                </button>
              )}
            </>
          )}
        </div>
          {/* ---- Student History Section ---- */}
<div className="mt-6">
  <h3 className="text-xl font-bold mb-2">📜 Student History</h3>
  {loadingHistory && <p>Loading history...</p>}
  {history && (
    <div className="space-y-4">
      {/* Sports History */}
      <div className="border p-3 rounded bg-yellow-100">
        <h4 className="font-semibold">Sports History</h4>
        {history.sportsHistory?.length > 0 ? (
          history.sportsHistory.map((sport, i) => (
            <div key={i} className="border-b py-1">
              <p>🏅 Sport: {sport}</p>
            </div>
          ))
        ) : (
          <p>No sports history found.</p>
        )}
      </div>

      {/* Captain History */}
      <div className="border p-3 rounded bg-green-100">
        <h4 className="font-semibold">Captain History</h4>
        {history.captainRecords?.length > 0 ? (
          history.captainRecords.map((c, i) => (
            <div key={i} className="border-b py-1">
              <p>🏆 Sport: {c.sport}</p>
              <p>📅 Session: {c.session?.session}</p>
              <p>👥 Team Members: {c.teamMembers?.length || 0}</p>
            </div>
          ))
        ) : (
          <p>No captain records found.</p>
        )}
      </div>

      {/* Member History */}
      <div className="border p-3 rounded bg-blue-100">
        <h4 className="font-semibold">Team Member History</h4>
        {history.memberRecords?.length > 0 ? (
          history.memberRecords.map((m, i) => (
            <div key={i} className="border-b py-1">
              <p>🏅 Sport: {m.members.find(mem => mem.urn === history.student?.urn)?.sport || "N/A"}</p>
              <p>📅 Session: {m.sessionId?.session}</p>
              <p>👤 Captain ID: {m.captainId}</p>
            </div>
          ))
        ) : (
          <p>No member records found.</p>
        )}
      </div>
    </div>
  )}
</div>

      </>
    )}
  </div>
);

};

export default StudentProfileForm;
