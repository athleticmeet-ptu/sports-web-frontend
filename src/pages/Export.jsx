import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, TextRun, HeadingLevel, WidthType, ImageRun } from "docx";
import API from "../services/api";

// 🔹 Helper function to fetch image buffer
const fetchImageBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image from ${url}`);
    const blob = await response.blob();
    return await blob.arrayBuffer();
  } catch (err) {
    console.error("Image fetch error:", err);
    return null;
  }
};
  const fetchImagesBuffer = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}`);
      }
      const blob = await response.blob();
      return await blob.arrayBuffer();
    } catch (error) {
      console.error('Error fetching image buffer:', error);
      return null; // Return null in case of error to avoid breaking the process
    }
  };
  const exportToExcel = async (students) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  const sessionName = students.length > 0 && students[0].session
    ? students[0].session
    : "N/A";

  // 🔹 Add Session heading at top
  worksheet.mergeCells('A1:S1');   // poora row merge
  const sessionCell = worksheet.getCell('A1');
  sessionCell.value = `Session: ${sessionName}`;
  sessionCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sessionCell.font = { bold: true, size: 14 };
  worksheet.getRow(1).height = 25;

  // 🔹 shift baaki headers 1 row neeche
  const headerStartRow = 2;

  worksheet.columns = [
    { width: 8 }, { width: 20 }, { width: 20 }, { width: 15 },
    { width: 20 }, { width: 25 }, { width: 10 }, { width: 10 },
    { width: 22 }, { width: 18 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 15 }, { width: 20 }, { width: 30 },
    { width: 20 }, { width: 15 }, { width: 10 },
  ];

  // Merge cells (shifted down by +1 row)
  worksheet.mergeCells('G2:H2');
  worksheet.mergeCells('I2:I3');
  worksheet.mergeCells('J2:K2');
  worksheet.mergeCells('L2:M2');
  worksheet.mergeCells('N2:N3');
  worksheet.mergeCells('O2:O3');
  worksheet.mergeCells('P2:P3');
  worksheet.mergeCells('Q2:Q3');
  worksheet.mergeCells('R2:R3');
  worksheet.mergeCells('S2:S3');

  ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
    worksheet.mergeCells(`${col}2:${col}3`);
  });

  // Row 2 headers
  worksheet.getCell('A2').value = 'Sr. No';
  worksheet.getCell('B2').value = 'Name';
  worksheet.getCell('C2').value = "Father's Name";
  worksheet.getCell('D2').value = 'Date of Birth';
  worksheet.getCell('E2').value = 'University Reg. No';
  worksheet.getCell('F2').value = 'Present Branch/Year';
  worksheet.getCell('G2').value = 'Year of Passing';
  worksheet.getCell('I2').value = 'Date of First Admission to College after Matric/+2 Exam';
  worksheet.getCell('J2').value = 'Name & year of the last Examination';
  worksheet.getCell('L2').value = 'No of years of';
  worksheet.getCell('N2').value = 'No of participation in Inter Varsity Tournament';
  worksheet.getCell('O2').value = 'Signature of Student';
  worksheet.getCell('P2').value = 'Home Address with Phone No';
  worksheet.getCell('Q2').value = 'Passport Size Photograph';
  worksheet.getCell('R2').value = 'Activity';
  worksheet.getCell('S2').value = 'Position';

  // Row 3 subheaders
  worksheet.getCell('G3').value = 'Matric\n7(a)';
  worksheet.getCell('H3').value = '+2\n7(b)';
  worksheet.getCell('J3').value = 'Name\n9(a)';
  worksheet.getCell('K3').value = 'Year\n9(b)';
  worksheet.getCell('L3').value = 'Graduate\n10(a)';
  worksheet.getCell('M3').value = 'PG\n10(b)';

  // Style for row 2 and 3
  [2, 3].forEach(rowNum => {
    const row = worksheet.getRow(rowNum);
    row.height = 35;
    row.eachCell(cell => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // 🔹 data rows ab 4th row se start honge
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const activity = s.events?.map(e => e.activity).join(', ') || '';
    const position = s.events?.map(e => e.position).join(', ') || '';

    const row = worksheet.addRow([
      i + 1,
      s.name || '',
      s.fatherName || '',
      s.dob || '',
      s.universityRegNo || '',
      s.branchYear || '',
      s.matricYear || '',
      s.plusTwoYear || '',
      s.firstAdmissionYear || '',
      s.lastExam || '',
      s.lastExamYear || '',
      s.interCollegeGraduateYears || '',
      s.interCollegePgYears || '',
      s.interVarsityYears || '',
      '',
      s.addressWithPhone || '',
      '',
      activity,
      position,
    ]);

    row.height = 90;

    // Signature
    if (s.signatureUrl) {
      try {
        const buffer = await fetchImagesBuffer(s.signatureUrl);
        const imageId = workbook.addImage({ buffer, extension: 'png' });
        worksheet.addImage(imageId, {
          tl: { col: 14, row: i + 3.3 }, // shift +1 row
          ext: { width: 100, height: 40 },
        });
      } catch (err) { console.error("Signature image error:", err); }
    }

    // Passport
    if (s.passportPhotoUrl) {
      try {
        const buffer = await fetchImagesBuffer(s.passportPhotoUrl);
        const imageId = workbook.addImage({ buffer, extension: 'png' });
        worksheet.addImage(imageId, {
          tl: { col: 16, row: i + 3.1 },
          ext: { width: 70, height: 80 },
        });
      } catch (err) { console.error("Passport photo error:", err); }
    }
  }

  // Styling for all cells
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'students.xlsx');
};

  


// 🔹 Export to Word
const safeText = (val) => {
  if (val === null || val === undefined || val === "" || val === 0) return "";
  return val.toString();
};

const formatDate = (val) => {
  if (!val) return "";
  // agar sirf year hai ya YYYY-MM
  if (/^\d{4}$/.test(val)) return val;
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [y,m] = val.split("-");
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${monthNames[parseInt(m)-1]} ${y}`;
  }
  return val.toString();
};

const exportToWord = async (students) => {
  const tableRows = [];

  // Header row
  tableRows.push(new DocxTableRow({
    children: [
      ...["Sr. No","Name","Father’s Name","Date of Birth","University Reg. No","Present Branch/Year"]
        .map(t => new DocxTableCell({
          rowSpan:2,
          children:[ new Paragraph({ children:[ new TextRun({ text:t, bold:true }) ] }) ]
        })),
      new DocxTableCell({ columnSpan:2, children:[ new Paragraph({ children:[ new TextRun({ text:"Year of Passing", bold:true }) ] }) ] }),
      new DocxTableCell({ rowSpan:2, children:[ new Paragraph({ children:[ new TextRun({ text:"Date of First Admission", bold:true }) ] }) ] }),
      new DocxTableCell({ columnSpan:2, children:[ new Paragraph({ children:[ new TextRun({ text:"Last Examination", bold:true }) ] }) ] }),
      new DocxTableCell({ columnSpan:3, children:[ new Paragraph({ children:[ new TextRun({ text:"Years of Participation", bold:true }) ] }) ] }),
      ...["Signature","Home Address","Passport Photo","Activity","Position"]
        .map(t => new DocxTableCell({
          rowSpan:2, children:[ new Paragraph({ children:[ new TextRun({ text:t, bold:true }) ] }) ]
        }))
    ]
  }));

  // Sub header row
  tableRows.push(new DocxTableRow({
    children: ["Matric","+2","Name","Year","Graduate","PG","Inter-Varsity"].map(t =>
      new DocxTableCell({ children:[ new Paragraph({ children:[ new TextRun({ text:t, bold:true }) ] }) ] })
    )
  }));

  // Data rows
  for (const [i,s] of students.entries()) {
    const signatureImage = s.signatureUrl ? await fetchImageBuffer(s.signatureUrl) : null;
    const passportImage = s.passportPhotoUrl ? await fetchImageBuffer(s.passportPhotoUrl) : null;

    const activity = safeText(s.sports?.join(", "));
    const position = s.events?.map(e=>`${safeText(e.activity)} : ${safeText(e.position)}`).join(", ") || "";

    const cells = [
      (i+1).toString(),
      safeText(s.name),
      safeText(s.fatherName),
      safeText(s.dob),
      safeText(s.universityRegNo),
      safeText(s.branchYear),
      safeText(s.matricYear),
      safeText(s.plusTwoYear),
      formatDate(s.firstAdmissionYear),
      safeText(s.lastExam),
      safeText(s.lastExamYear),
      safeText(s.interCollegeGraduateYears),
      safeText(s.interCollegePgYears),
      safeText(s.interVarsityYears),
      signatureImage ? new ImageRun({ data:signatureImage, transformation:{ width:60, height:30 } }) : "",
      safeText(s.addressWithPhone),
      passportImage ? new ImageRun({ data:passportImage, transformation:{ width:60, height:60 } }) : "",
      activity,
      position
    ];

    tableRows.push(new DocxTableRow({
      children: cells.map(val => new DocxTableCell({
        children:[ new Paragraph({ children:[ val instanceof ImageRun ? val : new TextRun(val) ] }) ]
      }))
    }));
  }

  const doc = new Document({
    sections: [{
      properties:{ page:{ size:{ orientation:"landscape" } } },
      children: [
        new Paragraph({ text:"Student List", heading:HeadingLevel.HEADING_1, spacing:{ after:300 } }),
        new Paragraph({
          children: [ new TextRun({
            text: `Session: ${students.length > 0 && students[0].session ? students[0].session : "N/A"}`,
            bold: true,
            size: 26,
          }) ],
          spacing: { after: 200 },
        }),
        new DocxTable({ rows: tableRows })
      ]
    }]
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, "students.docx");
};



// 🔹 Main Component
const StudentExport = () => {
  const [students, setStudents] = useState([]);
  const [sports, setSports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [positions, setPositions] = useState([]);

  const [selectedSport, setSelectedSport] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  // 🔹 Load dropdown values
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [sportsRes, sessionsRes, positionsRes] = await Promise.all([
          API.get(`/admin/sports`),
          API.get(`/admin/sessions`),
          API.get(`/admin/positions`),
        ]);
        setSports(sportsRes.data);
        setSessions(sessionsRes.data);
        setPositions(positionsRes.data);
      } catch (err) {
        console.error("❌ Error fetching filters:", err);
      }
    };
    loadFilters();
  }, []);

  // 🔹 Load students when filter changes
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedSport && !selectedSession && !selectedPosition) return;
      try {
        const res = await API.get(
          `/admin/export?session=${selectedSession}&sport=${selectedSport}&position=${selectedPosition}`
        );
        setStudents(res.data);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      }
    };
    loadStudents();
  }, [selectedSport, selectedSession, selectedPosition]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Export Students</h1>

      {/* 🔹 Filters */}
      <div className="flex gap-3 mb-4">
        {/* Session Dropdown */}
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">-- Select Session --</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.session} {/* 👈 naam dikhana hai */}
            </option>
          ))}
        </select>

{/* Sport Dropdown */}
<select
  value={selectedSport}
  onChange={(e) => setSelectedSport(e.target.value)}
  className="border p-2 rounded"
>
  <option value="">-- Select Sport --</option>
  {sports.map((sport, idx) => (
    <option key={sport._id || idx} value={sport._id || sport.name || sport}>
      {sport.name || sport}
    </option>
  ))}
</select>

{/* Position Dropdown */}
<select
  value={selectedPosition}
  onChange={(e) => setSelectedPosition(e.target.value)}
  className="border p-2 rounded"
>
  <option value="">-- Select Position --</option>
  {positions.map((pos, idx) => (
    <option key={pos._id || idx} value={pos._id || pos.position || pos}>
      {pos.position || pos}
    </option>
  ))}
</select>

      </div>

      {/* 🔹 Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => exportToExcel(students)}
          disabled={!students.length}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
        >
          Export to Excel
        </button>

        <button
          onClick={() => exportToWord(students)}
          disabled={!students.length}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Export to Word
        </button>
      </div>
    </div>
  );
};

export default StudentExport;