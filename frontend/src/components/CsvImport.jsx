/**
 * CsvImport.jsx
 * Drag-and-drop CSV upload with preview, progress, and results.
 */

import { useState, useRef } from "react";
import { api } from "../api";
import { Upload, FileText, Download, CheckCircle, AlertTriangle, X } from "lucide-react";

export default function CsvImport({ userId, onImported, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }
    setFile(f);
    setError("");
    setResult(null);

    // Preview first few rows
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").filter(l => l.trim());
      const headers = lines[0]?.split(",").map(h => h.trim());
      const rows = lines.slice(1, 6).map(l => l.split(",").map(c => c.trim()));
      setPreview({ headers, rows, totalRows: lines.length - 1 });
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("csvFile", file);
      formData.append("userId", userId);

      const res = await api.post("/activity/csv-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      if (onImported) onImported();
    } catch (err) {
      setError(err.response?.data?.error || "Import failed. Check your CSV format.");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    window.open("http://localhost:5000/activity/sample-csv", "_blank");
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose && onClose()}>
      <div className="modal-box" style={{ maxWidth: 600 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Upload size={22} /> Import CSV
          </h2>
          <button
            className="btn-ghost btn-sm"
            onClick={onClose}
            style={{ borderRadius: "50%", width: 36, height: 36, padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Download template */}
        <button
          className="btn-ghost"
          onClick={downloadTemplate}
          style={{ fontSize: "0.85rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Download size={14} /> Download Sample Template
        </button>

        {/* Drop zone */}
        {!result && (
          <div
            className={`csv-dropzone ${dragOver ? "csv-dropzone-active" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={e => handleFile(e.target.files[0])}
            />
            {file ? (
              <div style={{ textAlign: "center" }}>
                <FileText size={32} color="var(--primary)" />
                <p style={{ fontWeight: 700, margin: "0.5rem 0 0.25rem" }}>{file.name}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {preview?.totalRows || 0} data rows detected
                </p>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Upload size={36} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                <p style={{ margin: "0.75rem 0 0.25rem", fontWeight: 600 }}>
                  Drag & drop your CSV here
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  or click to browse
                </p>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {preview && !result && (
          <div style={{ marginTop: "1rem", overflowX: "auto" }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              Preview (first 5 rows):
            </p>
            <table className="csv-preview-table">
              <thead>
                <tr>
                  {preview.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b", padding: "0.75rem 1rem",
            borderRadius: "10px", marginTop: "1rem", fontSize: "0.9rem",
            display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="csv-result">
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <CheckCircle size={48} color="var(--primary)" />
              <h3 style={{ marginTop: "0.5rem" }}>Import Complete!</h3>
            </div>
            <div className="csv-result-grid">
              <div className="csv-result-stat">
                <span className="csv-result-num" style={{ color: "var(--primary)" }}>{result.imported}</span>
                <span className="csv-result-label">Imported</span>
              </div>
              <div className="csv-result-stat">
                <span className="csv-result-num" style={{ color: "#ef4444" }}>{result.failed}</span>
                <span className="csv-result-label">Failed</span>
              </div>
              <div className="csv-result-stat">
                <span className="csv-result-num" style={{ color: "#6366f1" }}>
                  {result.totalCarbonKg}
                </span>
                <span className="csv-result-label">kg CO₂</span>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#ef4444" }}>
                  Errors (first {result.errors.length}):
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} style={{ fontSize: "0.8rem", color: "#991b1b", margin: "0.25rem 0" }}>
                    Row {e.row}: {e.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          {!result ? (
            <>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                style={{ flex: 1 }}
              >
                {importing ? "Importing…" : "📥 Import Data"}
              </button>
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
            </>
          ) : (
            <button onClick={onClose} style={{ flex: 1 }}>✅ Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
