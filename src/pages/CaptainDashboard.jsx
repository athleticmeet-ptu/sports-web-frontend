// src/pages/CaptainDashboard.jsx
import React, { useEffect, useState,useRef } from 'react';
import API from '../services/api';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function CaptainDashboard() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [captainInfo, setCaptainInfo] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [step, setStep] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
   const [history, setHistory] = useState(null);
      const certRefs = useRef([]);

  const fetchSessions = async () => {
    try {
      const res = await API.get('/session');
      const data = res.data || [];
      setSessions(data);
      const active = data.find(s => s.isActive);
      if (active) {
        setSelectedSession(active._id);
        setActiveSession(active);
      }
    } catch {
      setErr('Failed to load sessions.');
    }
  };
const fetchCaptainInfo = async (sessionId) => {
  try {
    const res = await API.get(`/captain/profile?sessionId=${sessionId}`);
    const captainData = res.data?.data || null;

    // yahan se direct captain ka URN nikalega
    if (captainData?.urn && selectedSession) {
      fetchCaptainHistory(captainData.urn,selectedSession);
    }

    return captainData;
  } catch {
    setErr('Failed to load captain info.');
    return null;
  }
};

const fetchCaptainHistory = async (urn,sessionId) => {
  try {
    setLoadingHistory(true);
    const res = await API.get(`/captain/history/${urn}/${sessionId}`);
    setHistory(res.data);
  } catch (err) {
    console.error("Error fetching captain history:", err);
  } finally {
    setLoadingHistory(false);
  }
};



  // 🔹 Call when component mounts
  const fetchTeamInfo = async (sessionId) => {
    try {
      const res = await API.get(`/captain/my-team?sessionId=${sessionId}`);
      return res.data || null;
    } catch {
      setErr('Failed to load team info.');
      return null;
    }
  };

  const decideStep = (captain, team) => {
    if (!captain?.phone) {
      setStep('profile');
    } else if (!team?.teamExists || (team.members?.length < captain.teamMemberCount)) {
      setStep('team');
    } else {
      setStep('done');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchSessions();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedSession) {
        setLoading(true);
        const sessionObj = sessions.find(s => s._id === selectedSession);
        setActiveSession(sessionObj || null);
        const captain = await fetchCaptainInfo(selectedSession);
        const team = await fetchTeamInfo(selectedSession);
        setCaptainInfo(captain);
        setTeamInfo(team);
        decideStep(captain, team);
        setLoading(false);
      }
    })();
  }, [selectedSession, sessions]);

  const handleCaptainSubmit = async (e) => {
    e.preventDefault();
    if (!activeSession?.isActive) return;
    try {
      setErr('');
      await API.post('/captain/profile', {
        phone: e.target.phone.value,
        sessionId: selectedSession,
      });
      const captain = await fetchCaptainInfo(selectedSession);
      setCaptainInfo(captain);
      decideStep(captain, teamInfo);
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to save profile.');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!activeSession?.isActive) return;
    setErr('');
    try {
      const form = e.target;
      const member = {
        name: form.name.value,
        branch: form.branch.value,
        urn: form.urn.value,
        year: Number(form.year.value),
        email: form.email.value,
        phone: form.phone.value,
        sport: captainInfo.sport,
      };

      await API.post('/captain/my-team/member', {
        sessionId: selectedSession,
        member: member
      });

      const updatedTeam = await fetchTeamInfo(selectedSession);
      setTeamInfo(updatedTeam);
      form.reset();

      if (updatedTeam.members.length >= captainInfo.teamMemberCount) {
        setStep('done');
      }
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to add team member.');
    }
  };
const generateCertificatesPDF = async () => {
  if (!captainInfo || !teamInfo) return;

  const pdf = new jsPDF("landscape", "px", "a4");
  const allMembers = [captainInfo, ...teamInfo.members];

  for (let i = 0; i < allMembers.length; i++) {
    const stu = allMembers[i];
    const input = certRefs.current[i];
    if (!input) continue;

    // ✅ Decide template based on position
    const template =
      stu.position?.toLowerCase() === "participated"
        ? "Certificates2.png"
        : "Certificates.png";

    // ✅ force background change before taking screenshot
    input.style.backgroundImage = `url('/${template}')`;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    if (i !== 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
  }

  pdf.save("Team_Certificates.pdf");
};

  if (loading) return <p className="p-6">Loading...</p>;

  const sessionExpired = activeSession && !activeSession.isActive;

return (
  <div className="p-6 max-w-3xl mx-auto">
    <h2 className="text-xl font-bold mb-4">Captain Dashboard</h2>
    {err && <p className="text-red-500 mb-2">{err}</p>}

    {/* Session Select */}
    <div className="mb-4">
      <label className="block mb-1 font-semibold">Select Session</label>
      <select
        value={selectedSession}
        onChange={e => setSelectedSession(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">-- Select Session --</option>
        {sessions.map(s => (
          <option key={s._id} value={s._id}>
            {s.session} {s.isActive ? '(Active)' : '(Expired)'}
          </option>
        ))}
      </select>
    </div>

    {sessionExpired && (
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
        This session has expired. You can only view your submitted data.
      </div>
    )}

    {/* Captain Profile */}
    {step === 'profile' && captainInfo && (
      <form onSubmit={handleCaptainSubmit} className="space-y-3 bg-white p-4 shadow rounded">
        <h3 className="text-lg font-semibold mb-3">Complete Your Profile</h3>
        <input value={captainInfo.name} disabled className="w-full border p-2 bg-gray-100" />
        <input value={captainInfo.branch} disabled className="w-full border p-2 bg-gray-100" />
        <input value={captainInfo.urn} disabled className="w-full border p-2 bg-gray-100" />
        <input value={captainInfo.year} disabled className="w-full border p-2 bg-gray-100" />
        <input value={captainInfo.sport} disabled className="w-full border p-2 bg-gray-100" />
        <input value={captainInfo.teamMemberCount} disabled className="w-full border p-2 bg-gray-100" />
        <input value={captainInfo.email} disabled className="w-full border p-2 bg-gray-100" />
        <input
          name="phone"
          placeholder="Phone"
          defaultValue={captainInfo.phone || ''}
          className="w-full border p-2"
          disabled={sessionExpired}
          required
        />
        {captainInfo?.position && (
          <p className="text-green-600 font-bold">
            Position: {captainInfo.position === 1 ? "🥇 1st" 
              : captainInfo.position === 2 ? "🥈 2nd" 
              : captainInfo.position === 3 ? "🥉 3rd" 
              : captainInfo.position + "th"}
          </p>
        )}
        {!sessionExpired && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        )}
      </form>
    )}

    {/* Add Team Members */}
    {step === 'team' && captainInfo && (
      <div className="space-y-6 bg-white p-4 shadow rounded">
        <h3 className="text-lg font-semibold mb-3">Add Team Members</h3>
        {teamInfo?.members?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Added Members:</h4>
            <table className="table-auto border-collapse border border-gray-300 w-full text-left">
              <thead>
                <tr>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Branch</th>
                  <th className="border px-2 py-1">URN</th>
                  <th className="border px-2 py-1">Year</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Phone</th>
                </tr>
              </thead>
              <tbody>
                {teamInfo.members.map((m, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">{m.name}</td>
                    <td className="border px-2 py-1">{m.branch}</td>
                    <td className="border px-2 py-1">{m.urn}</td>
                    <td className="border px-2 py-1">{m.year}</td>
                    <td className="border px-2 py-1">{m.email}</td>
                    <td className="border px-2 py-1">{m.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!sessionExpired && teamInfo.members.length < captainInfo.teamMemberCount && (
          <form onSubmit={handleAddMember} className="space-y-3 border p-4 rounded">
            <h4 className="font-semibold mb-3">
              Enter Details for Member {teamInfo.members.length + 1} of {captainInfo.teamMemberCount}
            </h4>
            <input name="name" placeholder="Full Name" className="w-full border p-2" required />
            <input name="branch" placeholder="Branch" className="w-full border p-2" required />
            <input name="urn" placeholder="URN" className="w-full border p-2" required />
            <input name="year" placeholder="Year" type="number" min="1" className="w-full border p-2" required />
            <input name="email" placeholder="Email" type="email" className="w-full border p-2" required />
            <input name="phone" placeholder="Phone" className="w-full border p-2" required />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Member</button>
          </form>
        )}
      </div>
    )}

    {/* Done Page */}
    {step === 'done' && teamInfo && (
      <div className="border p-4 rounded shadow-sm bg-white">
        <h3 className="text-lg font-semibold mb-3">Team Submitted</h3>
        <p><strong>Sport:</strong> {captainInfo.sport}</p>
        <p className="mt-2 font-bold text-blue-600">
          Final Position: {captainInfo.position === 1 ? "🥇 1st" 
            : captainInfo.position === 2 ? "🥈 2nd" 
            : captainInfo.position === 3 ? "🥉 3rd" 
            : captainInfo.position}
        </p>

        <p><strong>Status:</strong> 
          <span className={
            teamInfo.status === 'approved' ? 'text-green-600 font-bold' :
            teamInfo.status === 'rejected' ? 'text-red-600 font-bold' :
            'text-yellow-600 font-bold'
          }>
            {teamInfo.status ? teamInfo.status.toUpperCase() : 'PENDING'}
          </span>
        </p>

        {/* Members Table */}
        <table className="table-auto border-collapse border border-gray-300 w-full text-left mt-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Branch</th>
              <th className="border px-2 py-1">URN</th>
              <th className="border px-2 py-1">Year</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Position</th>
            </tr>
          </thead>
          <tbody>
            {teamInfo.members.map((m, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{i + 1}</td>
                <td className="border px-2 py-1">{m.name}</td>
                <td className="border px-2 py-1">{m.branch}</td>
                <td className="border px-2 py-1">{m.urn}</td>
                <td className="border px-2 py-1">{m.year}</td>
                <td className="border px-2 py-1">{m.email}</td>
                <td className="border px-2 py-1">{m.phone}</td>
                <td className="border px-2 py-1">
                  {m.position === 1 ? "🥇 1st" 
                    : m.position === 2 ? "🥈 2nd" 
                    : m.position === 3 ? "🥉 3rd" 
                    : m.position }
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 font-semibold">
          {teamInfo.status === 'approved'
            ? 'Your team has been approved. Congratulations!'
            : teamInfo.status === 'rejected'
              ? 'Your team was rejected. Please contact admin.'
              : 'All team members added. Waiting for approval.'}
        </p>

        {sessionExpired && (
          <p className="mt-2 text-red-500 font-semibold">This session has expired.</p>
        )}

        {/* History Section */}
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">📜 Captain History</h3>
          {loadingHistory && <p>Loading history...</p>}
          {history && (
            <div className="space-y-4">
              {/* Sports History */}
              <div className="border p-3 rounded bg-yellow-100">
                <h4 className="font-semibold">Sports History</h4>
                {history.sportsHistory?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {history.sportsHistory.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No sports history found.</p>
                )}
              </div>

              {/* Captain Records */}
              <div className="border p-3 rounded bg-green-100">
                <h4 className="font-semibold">Captain Records</h4>
                {history.captainRecords?.length > 0 ? (
                  history.captainRecords.map((c, i) => (
                    <div key={i} className="border-b py-1">
                      <p>Sport: {c.sport}</p>
                      <p>Session: {c.session?.session}</p>
                      <p>Team Members: {c.teamMemberCount || 0}</p>
                      <p>Position: {c.position || 0}</p>
                    </div>
                  ))
                ) : (
                  <p>No captain records found.</p>
                )}
              </div>

              {/* Member Records */}
              <div className="border p-3 rounded bg-blue-100">
                <h4 className="font-semibold">Team Member Records</h4>
                {history.memberRecords?.length > 0 ? (
                  history.memberRecords.map((m, i) => (
                    <div key={i} className="border-b py-1">
                      <p>Session: {m.sessionId?.session}</p>
                      <p>Total Members: {m.members?.length || 0}</p>
                    </div>
                  ))
                ) : (
                  <p>No member records found.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Certificates */}
        {/* Certificates */}
        {captainInfo.certificateAvailable ? (
  <>
    <button
      onClick={generateCertificatesPDF}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      Download Certificates (Captain + Team)
    </button>

    {/* Hidden Certificates Preview */}
    <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
      {[captainInfo, ...teamInfo.members].map((stu, i) => {
        // ✅ Captain ka position use karo har student ke liye
        const captainPosition = captainInfo?.position?.toLowerCase();

        // ✅ template select karo (sirf captain position ke hisaab se)
        const template =
          captainPosition === "participated"
            ? "Certificates2.png"
            : "Certificates.png";

        // ✅ styles select karo template ke hisaab se
        const styles =
          template === "Certificates2.png"
            ? {
                name: {
                  top: "344px",
                  left: "470px",
                  fontSize: "32px",
                  textAlign: "center",
                },
                urn: { top: "410px", left: "600px", fontSize: "24px" },
                branch: { top: "410px", left: "240px", fontSize: "24px" },
                sport: { top: "455px", left: "320px", fontSize: "20px" },
                session: { top: "460px", left: "591px", fontSize: "20px" },
              }
            : {
                name: {
                  top: "340px",
                  left: "0",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                },
                urn: { top: "405px", left: "640px", fontSize: "24px" },
                branch: { top: "405px", left: "185px", fontSize: "24px" },
                sport: { top: "465px", left: "435px", fontSize: "20px" },
                session: { top: "465px", left: "710px", fontSize: "20px" },
                position: { top: "465px", right: "750px", fontSize: "20px" },
              };

        return (
          <div
            key={i}
            ref={(el) => (certRefs.current[i] = el)}
            style={{
              width: "1000px",
              height: "700px",
              backgroundImage: `url('/${template}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              marginBottom: "20px",
            }}
          >
            <div style={{ position: "absolute", ...styles.name }}>
              {stu.name}
            </div>
            <div style={{ position: "absolute", ...styles.urn }}>
              {stu.urn}
            </div>
            <div style={{ position: "absolute", ...styles.branch }}>
              {stu.branch}
            </div>
            <div style={{ position: "absolute", ...styles.sport }}>
              {stu.sport}
            </div>
            <div style={{ position: "absolute", ...styles.session }}>
              {activeSession?.session}
            </div>
            <div style={{ position: "absolute", ...styles.position }}>
              {/* ✅ Sabko captain ka hi position show karo */}
              {captainInfo?.position}
            </div>
          </div>
        );
      })}
    </div>
  </>
) : (
  <p className="mt-4 text-red-600 font-semibold">
    ⚠️ Certificate not yet available
  </p>
)}

      </div>
    )}
  </div>
);

}

export default CaptainDashboard;
