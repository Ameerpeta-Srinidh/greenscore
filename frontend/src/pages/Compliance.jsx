import { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Shield, Clock, AlertTriangle, CheckCircle, FileText, Bell,
  ChevronDown, ChevronUp, BookOpen, Zap, TrendingUp, Lock
} from "lucide-react";

export default function Compliance() {
  const { auth } = useAuth();
  const userId = auth?.userId ? String(auth.userId) : null;

  const [brsrData, setBrsrData] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedIndicator, setExpandedIndicator] = useState(null);
  const [manualInputs, setManualInputs] = useState({});
  const [saveMsg, setSaveMsg] = useState("");
  const [gated, setGated] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [readinessRes, calendarRes, updatesRes] = await Promise.all([
        api.get(`/compliance/readiness/${userId}`).catch(() => ({ data: null })),
        api.get("/compliance/calendar"),
        api.get("/compliance/updates?limit=5"),
      ]);

      setReadiness(readinessRes.data);
      setCalendar(calendarRes.data);
      setUpdates(updatesRes.data);

      // Try loading BRSR (may be gated)
      try {
        const brsrRes = await api.get(`/compliance/brsr/${userId}`);
        setBrsrData(brsrRes.data);
      } catch (err) {
        if (err.response?.status === 403) setGated(true);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveManualData = async () => {
    try {
      await api.post(`/compliance/brsr/${userId}/manual`, { data: manualInputs });
      setSaveMsg("✅ Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
      loadData();
    } catch (err) {
      setSaveMsg(err.response?.data?.error || "Failed to save");
    }
  };

  if (loading) {
    return (
      <div className="container">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)", marginBottom: "1rem" }} />
        ))}
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "brsr", label: "BRSR Indicators", icon: FileText },
    { id: "calendar", label: "Deadlines", icon: Clock },
    { id: "updates", label: "Regulatory News", icon: Bell },
  ];

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          padding: "12px", borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
        }}>
          <Shield size={24} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>BRSR Compliance</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Auto-fill SEBI BRSR indicators + track filing deadlines
          </p>
        </div>
        {auth?.trialActive && (
          <span className="badge badge-green" style={{ marginLeft: "auto" }}>
            🎁 Trial: {auth.trialDaysLeft}d left
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={activeTab === t.id ? "" : "btn-ghost"}
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem",
                background: activeTab === t.id ? "var(--primary)" : undefined }}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── OVERVIEW ─── */}
      {activeTab === "overview" && (
        <>
          {/* Readiness Card */}
          {readiness && (
            <div className="card" style={{ marginBottom: "1.5rem", border: "2px solid #f59e0b22" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                {/* Gauge */}
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981"
                      strokeWidth="10" strokeDasharray={`${(readiness.readiness.readinessPercent / 100) * 314} 314`}
                      strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.8rem", fontWeight: 900 }}>{readiness.readiness.readinessPercent}%</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)" }}>READY</span>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ margin: "0 0 0.5rem" }}>BRSR Readiness — FY {readiness.financialYear}</h3>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    <span className="badge badge-green">{readiness.readiness.autoFilled}/{readiness.readiness.autoCalcCount} auto-filled</span>
                    <span className="badge badge-yellow">{readiness.readiness.manualCount} need manual input</span>
                    <span className="badge badge-gray">{readiness.totalActivities} activities</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>
                    {readiness.readiness.readinessPercent >= 80
                      ? "🎉 Great progress! Most auto-calculable indicators are filled."
                      : readiness.readiness.readinessPercent >= 40
                        ? "⚡ Good start! Log more activities to improve coverage."
                        : "📝 Start logging activities to auto-fill BRSR indicators."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
            <div className="card" style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", borderColor: "#bbf7d0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <TrendingUp size={18} color="#10b981" />
                <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Total Emissions (FY)</h4>
              </div>
              <p style={{ fontSize: "1.8rem", fontWeight: 900, margin: "0 0 0.25rem", color: "#065f46" }}>
                {readiness ? (readiness.totalEmissions / 1000).toFixed(2) : "—"} <small style={{ fontSize: "0.9rem" }}>tCO₂e</small>
              </p>
            </div>

            {/* Next Deadline */}
            {calendar?.deadlines?.[0] && (() => {
              const next = calendar.deadlines.find(d => d.status.daysLeft >= 0) || calendar.deadlines[0];
              return (
                <div className="card" style={{ background: "linear-gradient(135deg, #fef3c7, #fffbeb)", borderColor: "#fde68a" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Clock size={18} color="#f59e0b" />
                    <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Next Deadline</h4>
                  </div>
                  <p style={{ fontWeight: 800, margin: "0 0 0.25rem", color: "#92400e" }}>
                    {next.title}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#b45309" }}>
                    {next.status.daysLeft} days — {next.deadline}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* High impact alerts */}
          {updates.filter(u => u.impact === "high").length > 0 && (
            <div className="card" style={{ marginBottom: "1.5rem", border: "2px solid #fef3c7" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <AlertTriangle size={18} color="#f59e0b" /> Action Required
              </h3>
              {updates.filter(u => u.impact === "high").map(u => (
                <div key={u.id} style={{
                  padding: "1rem", background: "#fffbeb", borderRadius: "10px",
                  border: "1px solid #fde68a", marginBottom: "0.5rem",
                }}>
                  <p style={{ fontWeight: 700, margin: "0 0 0.25rem", color: "#92400e" }}>{u.title}</p>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", color: "#b45309" }}>{u.summary}</p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#d97706", fontWeight: 600 }}>
                    👉 {u.actionRequired}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── BRSR INDICATORS ─── */}
      {activeTab === "brsr" && (
        <>
          {gated && !brsrData ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <Lock size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
              <h3>BRSR Dashboard requires Business plan</h3>
              <p>Upgrade to access auto-filled BRSR indicators, compliance tracking, and audit trails.</p>
              <a href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                <button>View Plans</button>
              </a>
            </div>
          ) : brsrData ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>
                  Principle 6 — Environment (FY {brsrData.financialYear})
                </h3>
                {saveMsg && <span style={{ color: "#10b981", fontWeight: 700 }}>{saveMsg}</span>}
              </div>

              {/* Essential Indicators */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: "#10b981", marginBottom: "1rem" }}>Essential Indicators (Mandatory)</h4>
                {brsrData.template.essential.map(ind => {
                  const value = brsrData.values[ind.dataField];
                  const hasValue = value !== undefined && value !== null && value !== 0 && value !== "";
                  const isExpanded = expandedIndicator === ind.id;

                  return (
                    <div key={ind.id} style={{
                      padding: "0.85rem 1rem", borderRadius: "10px", marginBottom: "0.5rem",
                      background: hasValue ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${hasValue ? "#bbf7d0" : "#fecaca"}`,
                      cursor: "pointer",
                    }} onClick={() => setExpandedIndicator(isExpanded ? null : ind.id)}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                          {hasValue ? <CheckCircle size={16} color="#10b981" /> : <AlertTriangle size={16} color="#ef4444" />}
                          <div>
                            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{ind.id}</span>
                            <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>{ind.indicator}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          {hasValue && (
                            <span style={{ fontWeight: 800, color: "#10b981" }}>
                              {typeof value === "number" ? value.toFixed(2) : value} {ind.unit !== "text" ? ind.unit : ""}
                            </span>
                          )}
                          {ind.autoCalc && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>AUTO</span>}
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}
                          onClick={e => e.stopPropagation()}>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>
                            {ind.description}
                          </p>
                          {ind.scope && <span className="badge badge-purple" style={{ marginBottom: "0.5rem" }}>Scope {ind.scope}</span>}
                          {!ind.autoCalc && (
                            <div style={{ marginTop: "0.5rem" }}>
                              <label style={{ fontSize: "0.82rem" }}>Manual Input ({ind.unit}):</label>
                              <input
                                type={ind.unit === "text" ? "text" : "number"}
                                step="0.01"
                                placeholder={`Enter ${ind.indicator}`}
                                value={manualInputs[ind.dataField] ?? brsrData.manualData[ind.dataField] ?? ""}
                                onChange={e => setManualInputs({ ...manualInputs, [ind.dataField]: ind.unit === "text" ? e.target.value : parseFloat(e.target.value) || "" })}
                                style={{ marginTop: "0.25rem" }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Leadership Indicators */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ color: "#6366f1", marginBottom: "1rem" }}>Leadership Indicators (Voluntary)</h4>
                {brsrData.template.leadership.map(ind => {
                  const value = brsrData.values[ind.dataField];
                  const hasValue = value !== undefined && value !== null && value !== 0 && value !== "";
                  return (
                    <div key={ind.id} style={{
                      padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "0.4rem",
                      background: hasValue ? "#f5f3ff" : "#f8fafc",
                      border: `1px solid ${hasValue ? "#c4b5fd" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {hasValue ? <CheckCircle size={14} color="#6366f1" /> : <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #cbd5e1" }} />}
                        <span style={{ fontSize: "0.85rem" }}><strong>{ind.id}</strong> — {ind.indicator}</span>
                      </div>
                      {hasValue && <span style={{ fontWeight: 700, color: "#6366f1", fontSize: "0.85rem" }}>{typeof value === "number" ? value.toFixed(2) : value}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Save button for manual data */}
              {Object.keys(manualInputs).length > 0 && (
                <button onClick={saveManualData} style={{ marginBottom: "1.5rem" }}>
                  💾 Save Manual Data
                </button>
              )}
            </>
          ) : (
            <div className="card"><p>Loading BRSR data...</p></div>
          )}
        </>
      )}

      {/* ─── CALENDAR ─── */}
      {activeTab === "calendar" && calendar && (
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Clock size={18} color="var(--primary)" /> Compliance Calendar — FY {calendar.financialYear}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {calendar.deadlines.map(d => (
              <div key={d.id} style={{
                padding: "1.25rem", borderRadius: "12px",
                background: "var(--bg-subtle)", border: `1px solid var(--border)`,
                borderLeft: `4px solid ${d.status.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>{d.title}</h4>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>{d.description}</p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span className="badge badge-gray">{d.deadline}</span>
                      {d.mandatory && <span className="badge badge-red">Mandatory</span>}
                      <span className="badge badge-blue" style={{ fontSize: "0.72rem" }}>{d.applicableTo}</span>
                    </div>
                  </div>
                  <div style={{
                    padding: "0.4rem 0.8rem", borderRadius: "8px",
                    background: `${d.status.color}15`, color: d.status.color,
                    fontWeight: 800, fontSize: "0.82rem", whiteSpace: "nowrap",
                  }}>
                    {d.status.label} — {d.status.daysLeft}d
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── REGULATORY UPDATES ─── */}
      {activeTab === "updates" && (
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <BookOpen size={18} color="var(--primary)" /> Regulatory Updates
          </h3>
          {updates.map(u => (
            <div key={u.id} style={{
              padding: "1.25rem", borderRadius: "12px", marginBottom: "0.75rem",
              background: "var(--bg-subtle)", border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", flex: 1 }}>{u.title}</h4>
                <span className={`badge badge-${u.impact === "high" ? "red" : u.impact === "medium" ? "yellow" : "gray"}`}>
                  {u.impact}
                </span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>{u.summary}</p>
              {u.actionRequired && (
                <p style={{ fontSize: "0.82rem", color: "#d97706", fontWeight: 600, margin: "0 0 0.25rem" }}>
                  👉 {u.actionRequired}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>📅 {u.date}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>📄 {u.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
