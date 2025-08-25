// src/components/CaptainExport.jsx
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import API from "../services/api";


const CaptainExport = () => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sports, setSports] = useState([]);
  const [positions,setPositions] = useState(["1st", "2nd", "3rd", "Participant"]);

  // selected filters
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  // fetch filters data (sessions, sports)
useEffect(() => {
  const fetchFilters = async () => {
    try {
      const res = await API.get("/admin/captain-filters");
      setSessions(res.data.sessions);
      setSports(res.data.sports);
      setPositions(res.data.positions);
    } catch (err) {
      console.error("Error fetching captain filters:", err);
    }
  };
  fetchFilters();
}, []);

  const fetchData = async () => {
    const payload = {
      session: selectedSession._id,
      sport: selectedSport,
      position: selectedPosition,
    };
    const res = await API.post("/admin/export-captains", payload);
    return res.data;
  };

  // ✅ Export as Excel
  const exportExcel = async () => {
    setLoading(true);
    const data = await fetchData();

    let rows = [];
    data.forEach((captain) => {
      rows.push({
        Type: "Captain",
        Name: captain.name,
        URN: captain.urn,
        Branch: captain.branch,
        Year: captain.year,
        Sport: captain.sport,
        Phone: captain.phone,
        Email: captain.email,
        Session: captain.session?.session || "-",
      });

      captain.teamMembers.forEach((m, idx) => {
        rows.push({
          Type: `Member ${idx + 1}`,
          Name: m.name,
          URN: m.urn,
          Branch: m.branch,
          Year: m.year,
          Phone: m.phone,
          Email: m.email,
        });
      });

      rows.push({}); // gap row
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Captains");
    XLSX.writeFile(wb, "captains_with_team.xlsx");
    setLoading(false);
  };

  // ✅ Export as Word (DOCX)
  const exportWord = async () => {
    setLoading(true);
    const data = await fetchData();

    const sections = data.map((captain) => {
      // Table header
      const rows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Name")] }),
            new TableCell({ children: [new Paragraph("URN")] }),
            new TableCell({ children: [new Paragraph("Branch-Year")] }),
            new TableCell({ children: [new Paragraph("Phone")] }),
            new TableCell({ children: [new Paragraph("Email")] }),
          ],
        }),
      ];

      // Team members rows
      captain.teamMembers.forEach((m) => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(m.name || "-")] }),
              new TableCell({ children: [new Paragraph(m.urn || "-")] }),
              new TableCell({
                children: [new Paragraph(`${m.branch || "-"} - ${m.year || "-"}`)],
              }),
              new TableCell({ children: [new Paragraph(m.phone || "-")] }),
              new TableCell({ children: [new Paragraph(m.email || "-")] }),
            ],
          })
        );
      });

      return {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Captain: ${captain.name} (${captain.urn})`,
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph(`Branch-Year: ${captain.branch} - ${captain.year}`),
          new Paragraph(`Sport: ${captain.sport}`),
          new Paragraph(`Phone: ${captain.phone} | Email: ${captain.email}`),
          new Paragraph(`Session: ${captain.session?.session || "-"}`),
          new Paragraph({ text: "Team Members:", bold: true }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }), // gap before next captain
        ],
      };
    });

    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "captains_with_team.docx");

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
       <select
  className="border p-2 rounded"
  value={selectedSession}
  onChange={(e) => setSelectedSession(e.target.value)}
>
  <option value="">All Sessions</option>
  {sessions.map((s, idx) => (
    <option key={idx} value={s}>
      {s.session}
    </option>
  ))}
</select>

<select
  className="border p-2 rounded"
  value={selectedSport}
  onChange={(e) => setSelectedSport(e.target.value)}
>
  <option value="">All Sports</option>
  {sports.map((sp, idx) => (
    <option key={idx} value={sp}>
      {sp}
    </option>
  ))}
</select>

<select
  className="border p-2 rounded"
  value={selectedPosition}
  onChange={(e) => setSelectedPosition(e.target.value)}
>
  <option value="">All Positions</option>
  {positions.map((p, idx) => (
    <option key={idx} value={p}>
      {p}
    </option>
  ))}
</select>

      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={exportExcel}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Exporting..." : "Export Excel"}
        </button>

        <button
          onClick={exportWord}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Exporting..." : "Export Word"}
        </button>
      </div>
    </div>
  );
};

export default CaptainExport;
