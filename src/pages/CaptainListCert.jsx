import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CaptainListCert = () => {
  const [captains, setCaptains] = useState([]);
  const navigate = useNavigate();

  const fetchCaptains = async () => {
    try {
      const res = await API.get("/admin/again/captains");
      setCaptains(res.data);
    } catch (err) {
      console.error("Error fetching captains", err);
    }
  };

  useEffect(() => {
    fetchCaptains();
  }, []);

  // ✅ Send Certificates
  const sendToCaptain = async (captainId) => {
    try {
      await API.post(`/admin/certificates/send/${captainId}`);
      // Optimistic update
      setCaptains((prev) =>
        prev.map((cap) =>
          cap._id === captainId ? { ...cap, certificateAvailable: true } : cap
        )
      );
      alert("Certificates sent!");
    } catch (err) {
      console.error("Error sending certificates", err);
      alert("Error sending certificates");
    }
  };

  // Filter lists based on certificateAvailable
  const pending = captains.filter((c) => !c.certificateAvailable);
  const sent = captains.filter((c) => c.certificateAvailable);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Captains with Position</h2>

      {/* Pending Section */}
      <h3 className="text-lg font-semibold mb-2 text-red-600">⏳ Pending</h3>
      <table className="w-full border mb-6">
        <thead>
          <tr>
            <th className="border px-4 py-2">Captain ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Position</th>
            <th className="border px-4 py-2">Session</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                🎉 No Pending Certificates
              </td>
            </tr>
          ) : (
            pending.map((cap) => (
              <tr key={cap._id}>
                <td className="border px-4 py-2">{cap.captainId}</td>
                <td className="border px-4 py-2">{cap.name}</td>
                <td className="border px-4 py-2">{cap.position}</td>
                <td className="border px-4 py-2">
                  {cap.session ? cap.session.name : "—"}
                </td>
                <td className="border px-4 py-2 flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => navigate(`/admin/certificates/${cap._id}`)}
                  >
                    Issue
                  </button>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => sendToCaptain(cap._id)}
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Sent Section */}
      <h3 className="text-lg font-semibold mb-2 text-green-600">✅ Sent</h3>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Captain ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Position</th>
            <th className="border px-4 py-2">Session</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {sent.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No Certificates Sent Yet
              </td>
            </tr>
          ) : (
            sent.map((cap) => (
              <tr key={cap._id}>
                <td className="border px-4 py-2">{cap.captainId}</td>
                <td className="border px-4 py-2">{cap.name}</td>
                <td className="border px-4 py-2">{cap.position}</td>
                <td className="border px-4 py-2">
                  {cap.session ? cap.session.name : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CaptainListCert;
