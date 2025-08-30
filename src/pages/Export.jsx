import React, { useState, useEffect, useRef } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  TextRun,
  HeadingLevel,
  ImageRun,
} from "docx";
import API from "../services/api";

// 🔹 Helper functions
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
const fetchImagesBuffer = fetchImageBuffer;

// 🔹 Export functions (Excel & Word)
const exportToExcel = async (students) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Students");

  const sessionName =
    students.length > 0 && students[0].session ? students[0].session : "N/A";

  // Session header
  worksheet.mergeCells("A1:S1");
  const sessionCell = worksheet.getCell("A1");
  sessionCell.value = `Session: ${sessionName}`;
  sessionCell.alignment = { vertical: "middle", horizontal: "center" };
  sessionCell.font = { bold: true, size: 14 };
  worksheet.getRow(1).height = 25;

  // Column widths
  worksheet.columns = [
    { width: 8 },
    { width: 20 },
    { width: 20 },
    { width: 15 },
    { width: 20 },
    { width: 25 },
    { width: 10 },
    { width: 10 },
    { width: 22 },
    { width: 18 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 15 },
    { width: 20 },
    { width: 30 },
    { width: 20 },
    { width: 15 },
    { width: 10 },
  ];

  // Merge header cells
  worksheet.mergeCells("G2:H2");
  worksheet.mergeCells("I2:I3");
  worksheet.mergeCells("J2:K2");
  worksheet.mergeCells("L2:M2");
  worksheet.mergeCells("N2:N3");
  worksheet.mergeCells("O2:O3");
  worksheet.mergeCells("P2:P3");
  worksheet.mergeCells("Q2:Q3");
  worksheet.mergeCells("R2:R3");
  worksheet.mergeCells("S2:S3");
  ["A", "B", "C", "D", "E", "F"].forEach((col) =>
    worksheet.mergeCells(`${col}2:${col}3`)
  );

  // Row 2 headers
  worksheet.getCell("A2").value = "Sr. No";
  worksheet.getCell("B2").value = "Name";
  worksheet.getCell("C2").value = "Father's Name";
  worksheet.getCell("D2").value = "Date of Birth";
  worksheet.getCell("E2").value = "University Reg. No";
  worksheet.getCell("F2").value = "Present Branch/Year";
  worksheet.getCell("G2").value = "Year of Passing";
  worksheet.getCell("I2").value = "Date of First Admission";
  worksheet.getCell("J2").value = "Last Examination";
  worksheet.getCell("L2").value = "No of years of";
  worksheet.getCell("N2").value =
    "No of participation in Inter Varsity Tournament";
  worksheet.getCell("O2").value = "Signature of Student";
  worksheet.getCell("P2").value = "Home Address with Phone No";
  worksheet.getCell("Q2").value = "Passport Size Photograph";
  worksheet.getCell("R2").value = "Activity";
  worksheet.getCell("S2").value = "Position";

  // Row 3 subheaders
  worksheet.getCell("G3").value = "Matric";
  worksheet.getCell("H3").value = "+2";
  worksheet.getCell("J3").value = "Name";
  worksheet.getCell("K3").value = "Year";
  worksheet.getCell("L3").value = "Graduate";
  worksheet.getCell("M3").value = "PG";

  // Style headers
  [2, 3].forEach((rowNum) => {
    const row = worksheet.getRow(rowNum);
    row.height = 35;
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Data rows
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const activity = s.sports?.join(", ") || "";
    const position = s.events?.map((e) => e.position).join(", ") || "";

    const row = worksheet.addRow([
      i + 1,
      s.name || "",
      s.fatherName || "",
      s.dob || "",
      s.universityRegNo || "",
      s.branchYear || "",
      s.matricYear || "",
      s.plusTwoYear || "",
      s.firstAdmissionYear || "",
      s.lastExam || "",
      s.lastExamYear || "",
      s.interCollegeGraduateYears || "",
      s.interCollegePgYears || "",
      s.interVarsityYears || "",
      "",
      s.addressWithPhone || "",
      "",
      activity,
      position,
    ]);

    row.height = 90;

    if (s.signatureUrl) {
      try {
        const buffer = await fetchImagesBuffer(s.signatureUrl);
        const imageId = workbook.addImage({ buffer, extension: "png" });
        worksheet.addImage(imageId, {
          tl: { col: 14, row: i + 3.3 },
          ext: { width: 100, height: 40 },
        });
      } catch {}
    }

    if (s.passportPhotoUrl) {
      try {
        const buffer = await fetchImagesBuffer(s.passportPhotoUrl);
        const imageId = workbook.addImage({ buffer, extension: "png" });
        worksheet.addImage(imageId, {
          tl: { col: 16, row: i + 3.1 },
          ext: { width: 70, height: 80 },
        });
      } catch {}
    }
  }

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "students.xlsx");
};

// 🔹 Word export helpers
const safeText = (val) => (!val ? "" : val.toString());
const formatDate = (val) => {
  if (!val) return "";
  if (/^\d{4}$/.test(val)) return val;
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [y, m] = val.split("-");
    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    return `${monthNames[parseInt(m)-1]} ${y}`;
  }
  return val.toString();
};

const exportToWord = async (students) => {
  const tableRows = [];

  // Header
  tableRows.push(
    new DocxTableRow({
      children: [
        ...["Sr. No","Name","Father’s Name","DOB","Reg No","Branch/Year"]
          .map(t => new DocxTableCell({
            rowSpan: 2,
            children: [ new Paragraph({ children: [ new TextRun({ text: t, bold:true }) ] }) ]
          })),
        new DocxTableCell({
          columnSpan: 2,
          children: [ new Paragraph({ children: [ new TextRun({ text: "Year of Passing", bold:true }) ] }) ]
        }),
        new DocxTableCell({
          rowSpan: 2,
          children: [ new Paragraph({ children: [ new TextRun({ text: "First Admission", bold:true }) ] }) ]
        }),
        new DocxTableCell({
          columnSpan: 2,
          children: [ new Paragraph({ children: [ new TextRun({ text: "Last Exam", bold:true }) ] }) ]
        }),
        new DocxTableCell({
          columnSpan: 3,
          children: [ new Paragraph({ children: [ new TextRun({ text: "Years of Participation", bold:true }) ] }) ]
        }),
        ...["Signature","Address","Passport","Activity","Position"]
          .map(t => new DocxTableCell({
            rowSpan: 2,
            children: [ new Paragraph({ children: [ new TextRun({ text: t, bold:true }) ] }) ]
          }))
      ]
    })
  );
  tableRows.push(
    new DocxTableRow({
      children: ["Matric","+2","Name","Year","Graduate","PG","Inter-Varsity"]
        .map(t => new DocxTableCell({
          children: [ new Paragraph({ children: [ new TextRun({ text: t, bold:true }) ] }) ]
        }))
    })
  );

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

    tableRows.push(
      new DocxTableRow({
        children: cells.map(val =>
          new DocxTableCell({
            children:[ new Paragraph({ children:[ val instanceof ImageRun ? val : new TextRun(val) ] }) ]
          })
        )
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties:{ page:{ size:{ orientation:"landscape" } } },
      children: [
        new Paragraph({
          text:"Student List",
          heading:HeadingLevel.HEADING_1,
          spacing:{ after:300 }
        }),
        new Paragraph({
          children:[ new TextRun({ text:`Session: ${students.length>0 && students[0].session ? students[0].session : "N/A"}`, bold:true, size:26 }) ],
          spacing:{ after:200 }
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
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterURN, setFilterURN] = useState("");
  const [selectedStudents, setSelectedStudents] = useState({});
  const [filterActivity, setFilterActivity] = useState("");
  const selectAllRef = useRef(null);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await API.get(`/admin/sessions`);
        setSessions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadSessions();
  }, []);

  // Load all students for selected session
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedSession) return;
      try {
        const res = await API.get(`/admin/export?session=${selectedSession}`);
        setStudents(res.data);
        const obj = {};
        res.data.forEach((s) => {
          obj[s.universityRegNo] = false;
        });
        setSelectedStudents(obj);
      } catch (err) {
        console.error(err);
      }
    };
    loadStudents();
  }, [selectedSession]);

  const handleCheckboxChange = (urn) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [urn]: !prev[urn],
    }));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = { ...selectedStudents };
    students
      .filter((s) => {
        const activityText = s.sports?.join(", ").toLowerCase() || "";
        return (
          (!filterName || s.name.toLowerCase().includes(filterName.toLowerCase())) &&
          (!filterURN || s.universityRegNo.toLowerCase().includes(filterURN.toLowerCase())) &&
          (!filterActivity || activityText.includes(filterActivity.toLowerCase()))
        );
      })
      .forEach((student) => {
        newSelection[student.universityRegNo] = isChecked;
      });
    setSelectedStudents(newSelection);
  };

  // update select all state
  useEffect(() => {
    if (!selectAllRef.current) return;
    const visibleStudents = students.filter((s) => {
      const activityText = s.sports?.join(", ").toLowerCase() || "";
      return (
        (!filterName || s.name.toLowerCase().includes(filterName.toLowerCase())) &&
        (!filterURN || s.universityRegNo.toLowerCase().includes(filterURN.toLowerCase())) &&
        (!filterActivity || activityText.includes(filterActivity.toLowerCase()))
      );
    });
    const total = visibleStudents.length;
    const selectedCount = visibleStudents.filter((s) => selectedStudents[s.universityRegNo]).length;
    if (selectedCount === 0) {
      selectAllRef.current.checked = false;
      selectAllRef.current.indeterminate = false;
    } else if (selectedCount === total) {
      selectAllRef.current.checked = true;
      selectAllRef.current.indeterminate = false;
    } else {
      selectAllRef.current.checked = false;
      selectAllRef.current.indeterminate = true;
    }
  }, [students, filterName, filterURN, filterActivity, selectedStudents]);

  const filteredStudents = students.filter((s) => {
    const activityText = s.sports?.join(", ").toLowerCase() || "";
    return (
      (!filterName || s.name.toLowerCase().includes(filterName.toLowerCase())) &&
      (!filterURN || s.universityRegNo.toLowerCase().includes(filterURN.toLowerCase())) &&
      (!filterActivity || activityText.includes(filterActivity.toLowerCase()))
    );
  });

  const getSelectedStudents = () => {
    return filteredStudents.filter((student) => selectedStudents[student.universityRegNo]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          📤 Export Students
        </h1>

        {/* 🔹 Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-400"
          >
            <option value="">-- Select Session --</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>{s.session}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Search by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-400"
          />

          <input
            type="text"
            placeholder="🔍 Search by URN"
            value={filterURN}
            onChange={(e) => setFilterURN(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
          
          <input
            type="text"
            placeholder="🔍 Search by Activity"
            value={filterActivity}
            onChange={(e) => setFilterActivity(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* 🔹 Table */}
        <div className="overflow-auto border rounded-xl max-h-[450px]">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 shadow">
              <tr>
                <th className="border p-2">
                  <input type="checkbox" ref={selectAllRef} onChange={handleSelectAll} /> Select All
                </th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Father's Name</th>
                <th className="border p-2">DOB</th>
                <th className="border p-2">Reg No</th>
                <th className="border p-2">Branch/Year</th>
                <th className="border p-2">Matric</th>
                <th className="border p-2">+2</th>
                <th className="border p-2">First Admission</th>
                <th className="border p-2">Last Exam</th>
                <th className="border p-2">Last Exam Year</th>
                <th className="border p-2">Graduate Years</th>
                <th className="border p-2">PG Years</th>
                <th className="border p-2">Inter Varsity Years</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">Activity</th>
                <th className="border p-2">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map((stu) => (
                <tr key={stu.universityRegNo} className="hover:bg-orange-50 transition">
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!selectedStudents[stu.universityRegNo]}
                      onChange={() => handleCheckboxChange(stu.universityRegNo)}
                    />
                  </td>
                  <td className="border p-2">{stu.name}</td>
                  <td className="border p-2">{stu.fatherName}</td>
                  <td className="border p-2">{stu.dob}</td>
                  <td className="border p-2">{stu.universityRegNo}</td>
                  <td className="border p-2">{stu.branchYear}</td>
                  <td className="border p-2">{stu.matricYear}</td>
                  <td className="border p-2">{stu.plusTwoYear}</td>
                  <td className="border p-2">{stu.firstAdmissionYear}</td>
                  <td className="border p-2">{stu.lastExam}</td>
                  <td className="border p-2">{stu.lastExamYear}</td>
                  <td className="border p-2">{stu.interCollegeGraduateYears}</td>
                  <td className="border p-2">{stu.interCollegePgYears}</td>
                  <td className="border p-2">{stu.interVarsityYears}</td>
                  <td className="border p-2">{stu.addressWithPhone}</td>
                  <td className="border p-2">{stu.sports?.join(", ")}</td>
                  <td className="border p-2">{stu.events?.map(e => `${e.activity}: ${e.position}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔹 Export Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => exportToExcel(getSelectedStudents())}
            disabled={getSelectedStudents().length === 0}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition disabled:opacity-50"
          >
            📊 Export to Excel ({getSelectedStudents().length})
          </button>
          <button
            onClick={() => exportToWord(getSelectedStudents())}
            disabled={getSelectedStudents().length === 0}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50"
          >
            📄 Export to Word ({getSelectedStudents().length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentExport;
