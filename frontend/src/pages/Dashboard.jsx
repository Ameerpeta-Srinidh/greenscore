import { useEffect, useState } from "react";
import { api } from "../api";
import GoalCard from "../components/GoalCard";
import ActivityHistory from "../components/ActivityHistory";
import EcoCity from "../components/EcoCity";
import BudgetGauge from "../components/BudgetGauge";
import ScoreRing from "../components/ScoreRing";
import CoachPanel from "../components/CoachPanel";
import StreakBadge from "../components/StreakBadge";
import BenchmarkCard from "../components/BenchmarkCard";
import CsvImport from "../components/CsvImport";
import { updateStreak } from "../components/StreakBadge";
import { getCarbonEquivalentShort } from "../utils/carbonContext";
import { useAuth } from "../context/AuthContext";
import { Mic, Plus, X, TrendingUp, Activity, Zap, Upload, Users, Building2 } from "lucide-react";
import { Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, LineElement, CategoryScale,
  LinearScale, Tooltip, Legend, PointElement, Filler,
} from "chart.js";

ChartJS.register(ArcElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, Filler);

// ─────────────────────────────────────────
//  FAB + Modal: Add Activity
// ─────────────────────────────────────────
function AddActivityModal({ userId, onAdded, onClose }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Try Chrome for voice input."); return; }
    const rec = new SpeechRecognition();
    rec.continuous = false; rec.interimResults = false; rec.lang = "en-US";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = e => setText(prev => prev ? prev + " " + e.results[0][0].transcript : e.results[0][0].transcript);
    rec.start();
  };

  const submit = async () => {
    if (!text.trim()) { setError("Please enter an activity."); return; }
    setError(""); setFeedback(null); setLoading(true);
    try {
      const res = await api.post("/activity/ai-text", { userId, text });
      const { parsedData } = res.data;
      if (parsedData?.recommendation) {
        setFeedback({ tip: parsedData.recommendation, saved: parsedData.potential_savings_kg });
      }
      updateStreak();
      setText("");
      setTimeout(() => { onAdded(); onClose(); }, feedback ? 2500 : 800);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0 }}>Log Activity</h2>
          <button className="btn-ghost btn-sm" onClick={onClose} style={{ borderRadius: "50%", width: 36, height: 36, padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        {feedback && (
          <div style={{
            background: "#ecfdf5", border: "1px solid #10b981",
            borderRadius: "12px", padding: "1rem", marginBottom: "1rem",
            display: "flex", gap: "0.75rem", alignItems: "flex-start",
          }}>
            <span style={{ fontSize: "1.5rem" }}>💡</span>
            <div>
              <p style={{ fontWeight: 700, color: "#065f46", margin: "0 0 0.25rem" }}>Smart Tip</p>
              <p style={{ color: "#047857", margin: 0, fontSize: "0.9rem" }}>{feedback.tip}</p>
              {feedback.saved > 0 && (
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600 }}>
                  💚 Save {feedback.saved} kg CO₂ with this change
                </p>
              )}
            </div>
          </div>
        )}

        <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Describe your activity in plain English:</p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            value={text}
            placeholder='e.g. "Drove 15 km to office" or "Had chicken biryani"'
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && submit()}
            autoFocus
          />
          <button
            onClick={startListening}
            className="btn-ghost"
            style={{
              borderRadius: "50%", width: 44, height: 44, padding: 0, flexShrink: 0,
              background: listening ? "#fee2e2" : undefined,
              color: listening ? "var(--danger)" : undefined,
              border: listening ? "2px solid var(--danger)" : undefined,
            }}
            title="Voice Input"
          >
            <Mic size={18} />
          </button>
        </div>
        {listening && (
          <p style={{ fontSize: "0.8rem", color: "var(--danger)", marginBottom: "0.75rem" }}>
            🔴 Listening…
          </p>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={submit} disabled={loading} style={{ flex: 1 }}>
            {loading ? "Analysing…" : "➕ Log Activity"}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────
export default function Dashboard() {
  const { auth } = useAuth();
  const userId = auth?.userId ? String(auth.userId) : null;

  const [data, setData] = useState(null);
  const [range, setRange] = useState("30d");
  const [viewScope, setViewScope] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  const hasOrg = !!auth?.organizationId;

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/${userId}?range=${range}&scope=${viewScope}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdded = () => { load(); setRefreshKey(k => k + 1); };

  useEffect(() => {
    if (userId) {
      load();
    } else {
      setLoading(false);
    }
  }, [range, userId, viewScope]);

  if (!userId && !loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
        <h2>Something went wrong</h2>
        <p>Could not identify your session. Please <a href="/login">log in again</a>.</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)" }} />
        ))}
      </div>
    );
  }

  const { totalCarbon = 0, count = 0, breakdown = {}, daily = {}, suggestions = [], greenScore = 0, scopeBreakdown, benchmark } = data;
  const equiv = getCarbonEquivalentShort(totalCarbon);

  // Compute days active for budget gauge
  const daysActive = Object.keys(daily).length || 1;

  return (
    <>
      <div className="container" style={{ paddingBottom: "6rem" }}>

        {/* ── Hero ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1.5rem",
          padding: "1.5rem", background: "white", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)", marginBottom: "1.5rem",
          border: "1px solid var(--border)", flexWrap: "wrap",
        }}>
          <ScoreRing score={greenScore} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{ marginBottom: "0.25rem", fontSize: "1.6rem" }}>
              Welcome back 👋
            </h1>
            <StreakBadge />
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
              <span className="badge badge-red">
                🔥 {totalCarbon.toFixed(1)} kg CO₂
              </span>
              <span className="badge badge-gray">
                📋 {count} activit{count !== 1 ? "ies" : "y"}
              </span>
              {equiv && (
                <span className="equiv-chip">{equiv}</span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <select
              value={range}
              onChange={e => setRange(e.target.value)}
              style={{ width: "auto", margin: 0 }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>

            {hasOrg && (
              <select
                value={viewScope}
                onChange={e => setViewScope(e.target.value)}
                style={{ width: "auto", margin: 0, fontSize: "0.82rem" }}
              >
                <option value="personal">👤 My Data</option>
                <option value="org">🏢 Team Data</option>
              </select>
            )}
          </div>
        </div>

        {/* ── Eco City ── */}
        <EcoCity score={greenScore} />

        {/* ── Stats Row ── */}
        <div className="card-grid" style={{ marginTop: "1.5rem" }}>
          <BudgetGauge monthlyKg={totalCarbon} daysLogged={daysActive} />
          <GoalCard userId={userId} totalCarbon={totalCarbon} />
        </div>

        {/* ── Scope Breakdown (Scope 1/2/3) ── */}
        {scopeBreakdown && (
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={18} color="var(--primary)" /> GHG Scope Breakdown
            </h3>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ width: 160, height: 160 }}>
                <Doughnut
                  data={{
                    labels: ["Scope 1 (Direct)", "Scope 2 (Electricity)", "Scope 3 (Value Chain)"],
                    datasets: [{
                      data: [scopeBreakdown["1"] || 0, scopeBreakdown["2"] || 0, scopeBreakdown["3"] || 0],
                      backgroundColor: ["#ef4444", "#3b82f6", "#8b5cf6"],
                      borderWidth: 2, borderColor: "white",
                    }],
                  }}
                  options={{ maintainAspectRatio: true, plugins: { legend: { display: false } } }}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 200 }}>
                {[
                  { label: "Scope 1 — Direct", value: scopeBreakdown["1"] || 0, color: "#ef4444", desc: "Company vehicles, on-site fuel" },
                  { label: "Scope 2 — Electricity", value: scopeBreakdown["2"] || 0, color: "#3b82f6", desc: "Purchased electricity & heating" },
                  { label: "Scope 3 — Value Chain", value: scopeBreakdown["3"] || 0, color: "#8b5cf6", desc: "Travel, food, supply chain" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{s.label}</span>
                        <span style={{ fontWeight: 700, color: s.color }}>{s.value.toFixed(1)} kg</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Benchmark ── */}
        {benchmark && (
          <div style={{ marginTop: "1.5rem" }}>
            <BenchmarkCard benchmark={benchmark} />
          </div>
        )}

        {/* ── Coach Panel ── */}
        <div style={{ marginTop: "1.5rem" }}>
          <CoachPanel breakdown={breakdown} totalCarbon={totalCarbon} suggestions={suggestions} />
        </div>

        {/* ── Charts ── */}
        <div className="card-grid" style={{ marginTop: "1.5rem" }}>
          <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} color="var(--primary)" /> Emission Breakdown
            </h3>
            {Object.keys(breakdown).length === 0 ? (
              <p>No data yet. Log your first activity!</p>
            ) : (
              <div style={{ height: 220 }}>
                <Pie
                  data={{
                    labels: Object.keys(breakdown),
                    datasets: [{
                      data: Object.values(breakdown),
                      backgroundColor: ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6"],
                      borderWidth: 2, borderColor: "white",
                    }],
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
                />
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={18} color="var(--primary)" /> Emissions Over Time
            </h3>
            {Object.keys(daily).length === 0 ? (
              <p>No trend data yet.</p>
            ) : (
              <div style={{ height: 220 }}>
                <Line
                  data={{
                    labels: Object.keys(daily),
                    datasets: [{
                      label: "kg CO₂",
                      data: Object.values(daily),
                      borderColor: "#10b981",
                      backgroundColor: "rgba(16,185,129,0.08)",
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: "#10b981",
                      pointRadius: 4,
                    }],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: "#f1f5f9" }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Activity History ── */}
        <div style={{ marginTop: "1.5rem" }}>
          <ActivityHistory userId={userId} refreshTrigger={refreshKey} onActivityDeleted={handleAdded} />
        </div>
      </div>

      {/* ── FABs ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: "0.75rem", zIndex: 100 }}>
        <button
          className="fab-secondary"
          onClick={() => setShowCsvImport(true)}
          title="Import CSV"
          aria-label="Import CSV data"
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "white", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            transition: "all 0.2s",
          }}
        >
          <Upload size={20} />
        </button>
        <button
          className="fab"
          onClick={() => setShowAddModal(true)}
          title="Log Activity"
          aria-label="Log new activity"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddActivityModal
          userId={userId}
          onAdded={handleAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showCsvImport && (
        <CsvImport
          userId={userId}
          onImported={handleAdded}
          onClose={() => setShowCsvImport(false)}
        />
      )}
    </>
  );
}
