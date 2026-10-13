/**
 * ReportExport.jsx
 * BRSR-aligned PDF ESG report generator using jsPDF.
 */

import { useState } from "react";
import { api } from "../api";
import { FileDown, Loader, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportExport({ userId }) {
  const [period, setPeriod] = useState("monthly");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/dashboard/${userId}/report?period=${period}&month=${month}`);
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!preview) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // ── Cover / Title ──
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("GreenScore+", 20, 25);
    doc.setFontSize(14);
    doc.text("ESG Sustainability Report", 20, 35);
    doc.setFontSize(10);
    doc.text(preview.period, 20, 45);
    if (preview.orgInfo?.name) {
      doc.text(`| ${preview.orgInfo.name}`, 20 + doc.getTextWidth(preview.period) + 5, 45);
    }

    // Report metadata
    y = 60;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 20, y);
    doc.text(`Prepared for: ${preview.userName || "User"}`, 20, y + 5);
    doc.text(`Scope: ${preview.viewScope === "org" ? "Organization-wide" : "Individual"}`, 20, y + 10);

    // ── Executive Summary ──
    y += 25;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    const totalCarbon = preview.totalCarbon?.toFixed(1) || "0.0";
    const activityCount = preview.count || 0;
    const changeText = preview.periodChange !== null
      ? `${preview.periodChange > 0 ? "+" : ""}${preview.periodChange}% vs previous period`
      : "No previous data for comparison";

    const summaryLines = [
      `Total Carbon Emissions: ${totalCarbon} kg CO₂e from ${activityCount} activities`,
      `Period Comparison: ${changeText}`,
      `Previous Period: ${preview.previousPeriodTotal?.toFixed(1) || "N/A"} kg CO₂e`,
    ];

    summaryLines.forEach(line => {
      doc.text(line, 20, y);
      y += 6;
    });

    // ── Scope Breakdown ──
    y += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Emissions by Scope (GHG Protocol)", 20, y);
    y += 3;

    const scopeData = [
      ["Scope 1 (Direct)", `${(preview.scopeBreakdown?.["1"] || 0).toFixed(1)} kg CO₂e`, "Company-owned vehicles, on-site fuel"],
      ["Scope 2 (Electricity)", `${(preview.scopeBreakdown?.["2"] || 0).toFixed(1)} kg CO₂e`, "Purchased electricity, heating"],
      ["Scope 3 (Value Chain)", `${(preview.scopeBreakdown?.["3"] || 0).toFixed(1)} kg CO₂e`, "Business travel, supply chain, food"],
      ["Total", `${totalCarbon} kg CO₂e`, ""],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Scope", "Emissions", "Description"]],
      body: scopeData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 20, right: 20 },
    });

    y = doc.lastAutoTable.finalY + 12;

    // ── Category Breakdown ──
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Emissions by Category", 20, y);
    y += 3;

    const breakdownData = Object.entries(preview.breakdown || {}).map(([type, kg]) => [
      type.charAt(0).toUpperCase() + type.slice(1),
      `${kg.toFixed(1)} kg CO₂e`,
      `${preview.totalCarbon > 0 ? ((kg / preview.totalCarbon) * 100).toFixed(1) : 0}%`,
    ]);

    if (breakdownData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Category", "Emissions", "Share"]],
        body: breakdownData,
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: 20, right: 20 },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    // ── Benchmark (if available) ──
    if (preview.benchmark) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Industry Benchmark", 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const b = preview.benchmark;
      doc.text(`Industry: ${b.industry} (${b.sizeTier} company)`, 20, y); y += 6;
      doc.text(`Your per-employee emissions: ${b.perEmployeeKg} kg CO₂e/month`, 20, y); y += 6;
      doc.text(`Industry average: ${b.benchmarkKg} kg CO₂e/month`, 20, y); y += 6;
      doc.text(`Status: ${b.diffPercent > 0 ? "+" : ""}${b.diffPercent}% vs average — ${b.label}`, 20, y);
      y += 12;
    }

    // ── BRSR Mapping ──
    if (preview.brsrMapping?.length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("BRSR Alignment (SEBI Framework)", 20, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [["Section", "Indicator", "Description", "Value"]],
        body: preview.brsrMapping.map(b => [b.section, b.indicator, b.description, b.value]),
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 20, right: 20 },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    // ── Daily Trend Data ──
    if (Object.keys(preview.daily || {}).length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Emission Trend", 20, y);
      y += 3;

      const dailyData = Object.entries(preview.daily).map(([date, kg]) => [date, `${kg.toFixed(2)} kg CO₂e`]);

      autoTable(doc, {
        startY: y,
        head: [["Date", "Emissions"]],
        body: dailyData,
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 20, right: 20 },
      });
    }

    // ── Footer ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `GreenScore+ ESG Report — ${preview.period} — Page ${i} of ${pageCount}`,
        pageWidth / 2, 290, { align: "center" }
      );
    }

    // Save
    const filename = `GreenScore_ESG_Report_${preview.period.replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <FileText size={20} color="var(--primary)" /> ESG Report Generator
      </h3>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
            Period
          </label>
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
            Month
          </label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={fetchReport} disabled={loading}>
            {loading ? <><Loader size={14} className="spin" /> Generating…</> : "📊 Generate Report"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div>
          <div style={{
            background: "linear-gradient(135deg, #ecfdf5, #f5f3ff)",
            borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem",
            border: "1px solid #d1fae5",
          }}>
            <h4 style={{ margin: "0 0 1rem", color: "var(--primary-dark)" }}>
              📋 Report Preview: {preview.period}
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
              <div className="report-stat-box">
                <span className="report-stat-value">{preview.totalCarbon?.toFixed(1)}</span>
                <span className="report-stat-label">Total kg CO₂e</span>
              </div>
              <div className="report-stat-box">
                <span className="report-stat-value">{preview.count}</span>
                <span className="report-stat-label">Activities</span>
              </div>
              <div className="report-stat-box">
                <span className="report-stat-value" style={{
                  color: preview.periodChange < 0 ? "#10b981" : preview.periodChange > 0 ? "#ef4444" : "#64748b"
                }}>
                  {preview.periodChange !== null ? (
                    <>
                      {preview.periodChange > 0 ? <TrendingUp size={14} style={{ marginRight: 4 }} /> : preview.periodChange < 0 ? <TrendingDown size={14} style={{ marginRight: 4 }} /> : <Minus size={14} style={{ marginRight: 4 }} />}
                      {preview.periodChange > 0 ? "+" : ""}{preview.periodChange}%
                    </>
                  ) : "N/A"}
                </span>
                <span className="report-stat-label">vs Previous</span>
              </div>
            </div>

            {/* Scope breakdown mini */}
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.5rem" }}>Scope Breakdown:</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className="badge badge-green">Scope 1: {(preview.scopeBreakdown?.["1"] || 0).toFixed(1)} kg</span>
                <span className="badge badge-blue">Scope 2: {(preview.scopeBreakdown?.["2"] || 0).toFixed(1)} kg</span>
                <span className="badge badge-purple">Scope 3: {(preview.scopeBreakdown?.["3"] || 0).toFixed(1)} kg</span>
              </div>
            </div>

            {/* BRSR */}
            {preview.brsrMapping?.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.5rem" }}>BRSR Mapping:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {preview.brsrMapping.map((b, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "0.82rem", padding: "0.35rem 0.5rem",
                      background: "rgba(255,255,255,0.6)", borderRadius: "6px",
                    }}>
                      <span style={{ color: "var(--text-muted)" }}>{b.indicator}: {b.description}</span>
                      <span style={{ fontWeight: 700 }}>{b.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={generatePDF} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
          }}>
            <FileDown size={18} /> Download PDF Report
          </button>
        </div>
      )}
    </div>
  );
}
