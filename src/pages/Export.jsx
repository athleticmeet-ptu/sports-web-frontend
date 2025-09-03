import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "../components/ui/modal";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
  Eye,
  Calendar,
  User,
  GraduationCap,
  MapPin,
  Trophy
} from "lucide-react";
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(null); // 'excel' | 'word' | null

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setError(null);
        const res = await API.get(`/admin/sessions`);
        setSessions(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  // Load all students for selected session
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedSession) return;
      try {
        setError(null);
        const res = await API.get(`/admin/export?session=${selectedSession}`);
        setStudents(res.data);
        const obj = {};
        res.data.forEach((s) => {
          obj[s.universityRegNo] = false;
        });
        setSelectedStudents(obj);
      } catch (err) {
        console.error(err);
        setError("Failed to load students");
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

  const openPreview = (mode) => {
    if (getSelectedStudents().length === 0) return;
    setPreviewMode(mode);
    setIsPreviewOpen(true);
  };

  const handleConfirmExport = async () => {
    const data = getSelectedStudents();
    if (previewMode === "excel") {
      await exportToExcel(data);
    } else if (previewMode === "word") {
      await exportToWord(data);
    }
    setIsPreviewOpen(false);
    setPreviewMode(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Loading export data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/admin")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Export Students</h1>
            <p className="text-muted-foreground mt-1">Export student data in Excel or Word format</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Session
                </label>
                <Select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  <option value="">-- Select Session --</option>
                  {sessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.session}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search by Name
                </label>
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Search by URN
                </label>
                <Input
                  type="text"
                  placeholder="Search by URN..."
                  value={filterURN}
                  onChange={(e) => setFilterURN(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Search by Activity
                </label>
                <Input
                  type="text"
                  placeholder="Search by activity..."
                  value={filterActivity}
                  onChange={(e) => setFilterActivity(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
            
      {/* Students List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Students ({filteredStudents.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {filteredStudents.every(s => selectedStudents[s.universityRegNo]) ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Students Found</h3>
                <p className="text-muted-foreground">No students available for the selected session and filters.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredStudents.map((stu, index) => (
                  <motion.div
                    key={stu.universityRegNo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
                      selectedStudents[stu.universityRegNo] ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={!!selectedStudents[stu.universityRegNo]}
                          onChange={() => handleCheckboxChange(stu.universityRegNo)}
                          className="w-4 h-4 text-primary"
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{stu.name}</h3>
                          <p className="text-sm text-muted-foreground">Father: {stu.fatherName}</p>
                          <p className="text-sm text-muted-foreground">DOB: {stu.dob}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">URN: {stu.universityRegNo}</p>
                          <p className="text-sm text-muted-foreground">Branch/Year: {stu.branchYear}</p>
                          <p className="text-sm text-muted-foreground">First Admission: {stu.firstAdmissionYear}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Matric: {stu.matricYear}</p>
                          <p className="text-sm text-muted-foreground">+2: {stu.plusTwoYear}</p>
                          <p className="text-sm text-muted-foreground">Last Exam: {stu.lastExam} ({stu.lastExamYear})</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Graduate Years: {stu.interCollegeGraduateYears}</p>
                          <p className="text-sm text-muted-foreground">PG Years: {stu.interCollegePgYears}</p>
                          <p className="text-sm text-muted-foreground">Inter Varsity: {stu.interVarsityYears}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Address: {stu.addressWithPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Activity: {stu.sports?.join(", ")}</p>
                          <p className="text-sm text-muted-foreground">
                            Position: {stu.events?.map((e) => `${e.activity}: ${e.position}`).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => openPreview("excel")}
                disabled={getSelectedStudents().length === 0}
                className="flex items-center gap-2 flex-1"
                variant="outline"
              >
                <Eye className="w-4 h-4" />
                Preview Excel ({getSelectedStudents().length})
              </Button>
              <Button
                onClick={() => openPreview("word")}
                disabled={getSelectedStudents().length === 0}
                className="flex items-center gap-2 flex-1"
                variant="outline"
              >
                <Eye className="w-4 h-4" />
                Preview Word ({getSelectedStudents().length})
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Export includes:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete student information (personal, academic, contact details)</li>
                <li>• Sports activities and position assignments</li>
                <li>• Academic history and examination records</li>
                <li>• Student signatures and passport photos (if available)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => { setIsPreviewOpen(false); setPreviewMode(null); }}>
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            {previewMode === "excel" ? "Preview for Excel Export" : "Preview for Word Export"}
          </ModalTitle>
        </ModalHeader>
        <ModalContent>
            <div className="p-4 overflow-auto space-y-4">
              {previewMode === "word" && (
                <>
                  <div className="text-2xl font-bold">Student List</div>
                  <div className="text-sm font-semibold">Session: {getSelectedStudents().length>0 && getSelectedStudents()[0].session ? getSelectedStudents()[0].session : "N/A"}</div>
                </>
              )}

              {previewMode === "excel" && (
                <div className="w-full overflow-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      {/* Session header row (A1:S1) */}
                      <tr>
                        <th colSpan={19} className="border p-2 text-center font-bold">Session: {getSelectedStudents().length>0 && getSelectedStudents()[0].session ? getSelectedStudents()[0].session : "N/A"}</th>
                      </tr>
                      {/* Row 2 headers with merges like Excel */}
                      <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <th className="border p-2" rowSpan={2}>Sr. No</th>
                        <th className="border p-2" rowSpan={2}>Name</th>
                        <th className="border p-2" rowSpan={2}>Father's Name</th>
                        <th className="border p-2" rowSpan={2}>Date of Birth</th>
                        <th className="border p-2" rowSpan={2}>University Reg. No</th>
                        <th className="border p-2" rowSpan={2}>Present Branch/Year</th>
                        <th className="border p-2" colSpan={2}>Year of Passing</th>
                        <th className="border p-2" rowSpan={2}>Date of First Admission</th>
                        <th className="border p-2" colSpan={2}>Last Examination</th>
                        <th className="border p-2" colSpan={2}>No of years of</th>
                        <th className="border p-2" rowSpan={2}>No of participation in Inter Varsity Tournament</th>
                        <th className="border p-2" rowSpan={2}>Signature of Student</th>
                        <th className="border p-2" rowSpan={2}>Home Address with Phone No</th>
                        <th className="border p-2" rowSpan={2}>Passport Size Photograph</th>
                        <th className="border p-2" rowSpan={2}>Activity</th>
                        <th className="border p-2" rowSpan={2}>Position</th>
                      </tr>
                      {/* Row 3 subheaders */}
                      <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <th className="border p-2">Matric</th>
                        <th className="border p-2">+2</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Year</th>
                        <th className="border p-2">Graduate</th>
                        <th className="border p-2">PG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getSelectedStudents().length === 0 ? (
                        <tr>
                          <td colSpan={19} className="text-center p-4 text-gray-500">No rows selected</td>
                        </tr>
                      ) : (
                        getSelectedStudents().map((s, idx) => (
                          <tr key={s.universityRegNo} className="hover:bg-orange-50 transition">
                            <td className="border p-2 text-center">{idx+1}</td>
                            <td className="border p-2">{s.name || ""}</td>
                            <td className="border p-2">{s.fatherName || ""}</td>
                            <td className="border p-2">{s.dob || ""}</td>
                            <td className="border p-2">{s.universityRegNo || ""}</td>
                            <td className="border p-2">{s.branchYear || ""}</td>
                            <td className="border p-2">{s.matricYear || ""}</td>
                            <td className="border p-2">{s.plusTwoYear || ""}</td>
                            <td className="border p-2">{s.firstAdmissionYear || ""}</td>
                            <td className="border p-2">{s.lastExam || ""}</td>
                            <td className="border p-2">{s.lastExamYear || ""}</td>
                            <td className="border p-2">{s.interCollegeGraduateYears || ""}</td>
                            <td className="border p-2">{s.interCollegePgYears || ""}</td>
                            <td className="border p-2">{s.interVarsityYears || ""}</td>
                            <td className="border p-2 text-center">
                              {s.signatureUrl ? <img src={s.signatureUrl} alt="signature" className="inline-block" style={{ width: 100, height: 40, objectFit: 'contain' }} /> : ""}
                            </td>
                            <td className="border p-2">{s.addressWithPhone || ""}</td>
                            <td className="border p-2 text-center">
                              {s.passportPhotoUrl ? <img src={s.passportPhotoUrl} alt="passport" className="inline-block" style={{ width: 70, height: 80, objectFit: 'cover' }} /> : ""}
                            </td>
                            <td className="border p-2">{s.sports?.join(", ") || ""}</td>
                            <td className="border p-2">{s.events?.map(e=>e.position).join(", ") || ""}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {previewMode === "word" && (
                <div className="w-full overflow-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      {/* First header row matching Word export */}
                      <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <th className="border p-2" rowSpan={2}>Sr. No</th>
                        <th className="border p-2" rowSpan={2}>Name</th>
                        <th className="border p-2" rowSpan={2}>Father’s Name</th>
                        <th className="border p-2" rowSpan={2}>DOB</th>
                        <th className="border p-2" rowSpan={2}>Reg No</th>
                        <th className="border p-2" rowSpan={2}>Branch/Year</th>
                        <th className="border p-2" colSpan={2}>Year of Passing</th>
                        <th className="border p-2" rowSpan={2}>First Admission</th>
                        <th className="border p-2" colSpan={2}>Last Exam</th>
                        <th className="border p-2" colSpan={3}>Years of Participation</th>
                        <th className="border p-2" rowSpan={2}>Signature</th>
                        <th className="border p-2" rowSpan={2}>Address</th>
                        <th className="border p-2" rowSpan={2}>Passport</th>
                        <th className="border p-2" rowSpan={2}>Activity</th>
                        <th className="border p-2" rowSpan={2}>Position</th>
                      </tr>
                      {/* Second header row */}
                      <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <th className="border p-2">Matric</th>
                        <th className="border p-2">+2</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Year</th>
                        <th className="border p-2">Graduate</th>
                        <th className="border p-2">PG</th>
                        <th className="border p-2">Inter-Varsity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getSelectedStudents().length === 0 ? (
                        <tr>
                          <td colSpan={19} className="text-center p-4 text-gray-500">No rows selected</td>
                        </tr>
                      ) : (
                        getSelectedStudents().map((s, idx) => (
                          <tr key={s.universityRegNo} className="hover:bg-orange-50 transition">
                            <td className="border p-2 text-center">{idx+1}</td>
                            <td className="border p-2">{s.name || ""}</td>
                            <td className="border p-2">{s.fatherName || ""}</td>
                            <td className="border p-2">{s.dob || ""}</td>
                            <td className="border p-2">{s.universityRegNo || ""}</td>
                            <td className="border p-2">{s.branchYear || ""}</td>
                            <td className="border p-2">{s.matricYear || ""}</td>
                            <td className="border p-2">{s.plusTwoYear || ""}</td>
                            <td className="border p-2">{formatDate(s.firstAdmissionYear) || ""}</td>
                            <td className="border p-2">{s.lastExam || ""}</td>
                            <td className="border p-2">{s.lastExamYear || ""}</td>
                            <td className="border p-2">{s.interCollegeGraduateYears || ""}</td>
                            <td className="border p-2">{s.interCollegePgYears || ""}</td>
                            <td className="border p-2">{s.interVarsityYears || ""}</td>
                            <td className="border p-2 text-center">
                              {s.signatureUrl ? <img src={s.signatureUrl} alt="signature" className="inline-block" style={{ width: 60, height: 30, objectFit: 'contain' }} /> : ""}
                            </td>
                            <td className="border p-2">{s.addressWithPhone || ""}</td>
                            <td className="border p-2 text-center">
                              {s.passportPhotoUrl ? <img src={s.passportPhotoUrl} alt="passport" className="inline-block" style={{ width: 60, height: 60, objectFit: 'cover' }} /> : ""}
                            </td>
                            <td className="border p-2">{s.sports?.join(", ") || ""}</td>
                            <td className="border p-2">{s.events?.map(e=>`${e.activity} : ${e.position}`).join(", ") || ""}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </ModalContent>
        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {getSelectedStudents().length} row(s) selected
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setIsPreviewOpen(false); setPreviewMode(null); }}
              >
                Close
              </Button>
              <Button
                onClick={handleConfirmExport}
                className="flex items-center gap-2"
              >
                {previewMode === "excel" ? (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    Export to Excel
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Export to Word
                  </>
                )}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StudentExport;
