/**
 * Reports.jsx
 * Dedicated page for ESG report generation and export.
 */

import ReportExport from "../components/ReportExport";
import { useAuth } from "../context/AuthContext";
import { FileText, Shield, Award } from "lucide-react";

export default function Reports() {
  const { auth } = useAuth();
  const userId = auth?.userId ? String(auth.userId) : null;

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        marginBottom: "1.5rem", flexWrap: "wrap",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          padding: "12px", borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
        }}>
          <FileText size={24} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>ESG Reports</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Generate BRSR-aligned sustainability reports for investors and auditors
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card" style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", borderColor: "#bbf7d0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Shield size={18} color="var(--primary)" />
            <h4 style={{ margin: 0, fontSize: "0.95rem" }}>BRSR Aligned</h4>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Reports map to SEBI's Business Responsibility and Sustainability Reporting framework
            (Principle 6 — Environment).
          </p>
        </div>

        <div className="card" style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", borderColor: "#c4b5fd" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Award size={18} color="#6366f1" />
            <h4 style={{ margin: 0, fontSize: "0.95rem" }}>GHG Protocol</h4>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Emissions are classified into Scope 1 (direct), Scope 2 (electricity),
            and Scope 3 (value chain) per GHG Protocol standards.
          </p>
        </div>
      </div>

      {/* Report Generator */}
      <ReportExport userId={userId} />
    </div>
  );
}
