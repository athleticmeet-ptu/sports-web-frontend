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

// ✅ (exportToExcel & exportToWord same as your code, not touched)

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
        res.data.forEach((s) => { obj[s.universityRegNo] = false; });
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
