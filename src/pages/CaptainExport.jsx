import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { Input } from "../components/ui/input";

import {
  Download,
  FileSpreadsheet,
  FileText,
  Crown,
  Users,
  RefreshCw,
  AlertCircle,
  Filter,
  Calendar,
  Trophy
} from "lucide-react";
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
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sports, setSports] = useState([]);
  const [positions, setPositions] = useState(["1st", "2nd", "3rd", "Participant"]);

  // selected filters
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [captains, setCaptains] = useState([]);
const [filterName, setFilterName] = useState("");
const [filterURN, setFilterURN] = useState("");
const [filterSport, setFilterSport] = useState("");


  useEffect(() => {
  const fetchCaptains = async () => {
    try {
      setError(null);
     const payload = {
  session: selectedSession || "",
  sport: selectedSport || "",
  position: selectedPosition || "",
  name: filterName || "",
  urn: filterURN || "",
  sportSearch: filterSport || "", // ✅ keep separate if needed
};

      const res = await API.post("/admin/captains", payload);
      setCaptains(res.data || []);
    } catch (err) {
      console.error("Error fetching captains:", err);
      setError("Failed to load captains list");
    }
  };
  fetchCaptains();
},  [selectedSession, selectedSport, selectedPosition, filterName, filterURN, filterSport]);


  // fetch filters data (sessions, sports)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setError(null);
        const res = await API.get("/admin/captain-filters");
        setSessions(res.data.sessions);
        setSports(res.data.sports);
        setPositions(res.data.positions);
      } catch (err) {
        console.error("Error fetching captain filters:", err);
        setError("Failed to load filter options");
      }
    };
    fetchFilters();
  }, []);

  const fetchData = async () => {
    const payload = {
      session: selectedSession || "",
      sport: selectedSport || "",
      position: selectedPosition || "",
      name: filterName || "",
      urn: filterURN || "",
      sportSearch: filterSport || "",
    };
    const res = await API.post("/admin/export-captains", payload);
    return res.data;
  };

  // ✅ Export as Excel
  const exportExcel = async () => {
    try {
      setLoading(true);
      setError(null);
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

        captain.teamMembers?.forEach((m, idx) => {
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
    } catch (err) {
      console.error("Error exporting Excel:", err);
      setError("Failed to export Excel file");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export as Word (DOCX)
  const exportWord = async () => {
    try {
      setLoading(true);
      setError(null);
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
        captain.teamMembers?.forEach((m) => {
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
    } catch (err) {
      console.error("Error exporting Word:", err);
      setError("Failed to export Word file");
    } finally {
      setLoading(false);
    }
  };

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
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Captain Export</h1>
          <p className="text-muted-foreground mt-1">Export captain and team member data in Excel or Word format</p>
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
              Export Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Session
                </label>
                <Select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  <option value="">All Sessions</option>
                  {sessions.map((s, idx) => (
                   <option key={s._id} value={s._id}>
  {s.session}
</option>

                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Sport
                </label>
                <Select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <option value="">All Sports</option>
                  {sports.map((sp, idx) => (
                    <option key={idx} value={sp}>
                      {sp}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
  <label className="text-sm font-medium">Search by Name</label>
  <Input value={filterName} onChange={(e) => setFilterName(e.target.value)} />
</div>
<div className="space-y-2">
  <label className="text-sm font-medium">Search by URN</label>
  <Input value={filterURN} onChange={(e) => setFilterURN(e.target.value)} />
</div>
<div className="space-y-2">
  <label className="text-sm font-medium">Search by Sport</label>
  <Input value={filterSport} onChange={(e) => setFilterSport(e.target.value)} />
</div>


              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Position
                </label>
                <Select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                >
                  <option value="">All Positions</option>
                  {positions.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Captain List */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Captains ({captains.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      {captains.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Captains Found</h3>
          <p className="text-muted-foreground">No captains match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {captains.map((cap, index) => (
            <motion.div
              key={cap.urn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{cap.name}</h3>
                  <p className="text-sm text-muted-foreground">URN: {cap.urn}</p>
                  <p className="text-sm text-muted-foreground">Branch-Year: {cap.branch} - {cap.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sport: {cap.sport}</p>
                  <p className="text-sm text-muted-foreground">Position: {cap.position}</p>
                  <p className="text-sm text-muted-foreground">Session: {cap.session?.session}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone: {cap.phone}</p>
                  <p className="text-sm text-muted-foreground">Email: {cap.email}</p>
                </div>
              </div>
              {cap.teamMembers?.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-muted space-y-1">
                  <p className="text-sm font-medium text-foreground">Team Members:</p>
                  {cap.teamMembers.map((m, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {m.name} ({m.urn}) - {m.branch} {m.year}
                    </p>
                  ))}
                </div>
              )}
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
        transition={{ delay: 0.2 }}
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
                onClick={exportExcel}
                disabled={loading}
                className="flex items-center gap-2 flex-1"
                variant="outline"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </>
                )}
              </Button>

              <Button
                onClick={exportWord}
                disabled={loading}
                className="flex items-center gap-2 flex-1"
                variant="outline"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Export Word
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Export includes:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Captain information (name, URN, branch, year, sport, contact details)</li>
                <li>• Team member details for each captain</li>
                <li>• Session information</li>
                <li>• Position assignments</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CaptainExport;
