import { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { History, Filter, FileText, Upload, Trash2, ChevronLeft, ChevronRight, Lock, Download } from "lucide-react";

export default function AuditTrail() {
  const { auth } = useAuth();
  const userId = auth?.userId;

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [gated, setGated] = useState(false);

  useEffect(() => { loadLogs(); }, [page, filter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/compliance/audit/${userId}?page=${page}&limit=20`;
      if (filter) url += `&entityType=${filter}`;
      const res = await api.get(url);
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.response?.status === 403) setGated(true);
    }
    setLoading(false);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "create": return { icon: "➕", color: "#10b981", bg: "#dcfce7" };
      case "update": return { icon: "✏️", color: "#6366f1", bg: "#ede9fe" };
      case "delete": return { icon: "🗑️", color: "#ef4444", bg: "#fee2e2" };
      case "import": return { icon: "📤", color: "#0ea5e9", bg: "#e0f2fe" };
      case "export": return { icon: "📥", color: "#8b5cf6", bg: "#f5f3ff" };
      case "upgrade": return { icon: "⭐", color: "#f59e0b", bg: "#fef3c7" };
      default: return { icon: "📝", color: "#64748b", bg: "#f1f5f9" };
    }
  };

  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " +
      dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  if (gated) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <Lock size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
          <h2>Audit Trail requires Business plan</h2>
          <p style={{ maxWidth: 500, margin: "0 auto 1.5rem" }}>
            Every data modification is logged with timestamps, user identity, and before/after snapshots.
            Essential for auditor review and SEBI compliance.
          </p>
          <a href="/pricing"><button>View Plans</button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          padding: "12px", borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <History size={24} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Audit Trail</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {total} total events — every change is traceable
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {[
          { label: "All", value: "" },
          { label: "Activities", value: "activity" },
          { label: "CSV Imports", value: "csv-import" },
          { label: "Evidence", value: "evidence" },
          { label: "BRSR", value: "brsr" },
          { label: "Subscriptions", value: "subscription" },
        ].map(f => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            className={filter === f.value ? "" : "btn-ghost"}
            style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem",
              background: filter === f.value ? "var(--primary)" : undefined }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Logs */}
      {loading ? (
        <div>{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: "10px", marginBottom: "0.5rem" }} />)}</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <History size={40} color="var(--text-light)" style={{ marginBottom: "1rem" }} />
          <p>No audit events yet. Start logging activities to see the trail.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {logs.map(log => {
            const { icon, color, bg } = getActionIcon(log.action);
            return (
              <div key={log._id} style={{
                padding: "1rem 1.25rem", borderRadius: "10px",
                background: "var(--bg-subtle)", border: "1px solid var(--border)",
                display: "flex", gap: "0.75rem", alignItems: "flex-start",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "10px",
                  background: bg, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {log.description || `${log.action} ${log.entityType}`}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>
                      {formatDate(log.createdAt)}
                    </span>
                    <span className={`badge badge-${log.action === "create" ? "green" : log.action === "delete" ? "red" : "blue"}`}
                      style={{ fontSize: "0.68rem" }}>
                      {log.action}
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: "0.68rem" }}>{log.entityType}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button className="btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
