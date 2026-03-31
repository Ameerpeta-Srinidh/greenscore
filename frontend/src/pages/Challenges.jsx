import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Trophy, Zap, Salad, Bike, Trash2, CheckCircle, Plus, Users } from "lucide-react";
import confetti from "canvas-confetti";

const ICONS = { Salad, Bike, Zap, Trash2 };

// Heatmap grid: N cells, 'done' for completed ones
function ChallengeHeatmap({ progress, target }) {
  const cells = Array.from({ length: target });
  return (
    <div className="heatmap-grid">
      {cells.map((_, i) => (
        <div
          key={i}
          className={`heatmap-cell ${i < progress ? "done" : ""} ${i === progress ? "today" : ""}`}
          title={i < progress ? "Completed" : i === progress ? "Next" : "Pending"}
        />
      ))}
    </div>
  );
}

export default function Challenges() {
  const { auth } = useAuth();
  const [allChallenges, setAllChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [sysRes, meRes] = await Promise.all([
        api.get("/user/challenges"),
        api.get("/user/me"),
      ]);
      setAllChallenges(sysRes.data);
      setMyChallenges(meRes.data.challenges || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const joinChallenge = async (id) => {
    try {
      const res = await api.post("/user/challenges/join", { challengeId: id });
      setMyChallenges(res.data);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join");
    }
  };

  const updateProgress = async (id) => {
    try {
      const res = await api.post("/user/challenges/progress", { challengeId: id });
      if (res.data.message.includes("Completed")) {
        confetti({ particleCount: 150, spread: 100 });
      }
      setMyChallenges(res.data.challenges);
      load(); // refresh
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)" }} />
        ))}
      </div>
    );
  }

  const activeChallenges = allChallenges.filter(c =>
    myChallenges.find(mc => mc.id === c.id && mc.status === "active")
  );
  const completedIds = new Set(
    myChallenges.filter(mc => mc.status === "completed").map(mc => mc.id)
  );
  const joinedIds = new Set(myChallenges.map(mc => mc.id));

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1>🌿 Eco-Challenges</h1>
        <p style={{ fontSize: "1rem" }}>
          Join limited-time quests to boost your GreenScore. Each challenge targets a specific habit.
        </p>
      </div>

      {/* Active challenges section */}
      {activeChallenges.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            ⚡ In Progress
          </h2>
          <div className="card-grid">
            {activeChallenges.map(c => {
              const mc = myChallenges.find(m => m.id === c.id && m.status === "active");
              const Icon = ICONS[c.icon] || Trophy;
              const pct = Math.round((mc.progress / c.target) * 100);

              return (
                <div key={c.id} className="card card-accent" style={{ borderTopColor: "var(--accent)" }}>
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "12px",
                      background: "var(--accent-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={22} color="var(--accent)" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1rem" }}>{c.title}</h3>
                      <p style={{ margin: 0, fontSize: "0.82rem" }}>{c.description}</p>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <ChallengeHeatmap progress={mc.progress} target={c.target} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {mc.progress}/{c.target} · {pct}%
                    </span>
                    <span className="badge badge-yellow">+{c.reward} pts on completion</span>
                  </div>

                  <button
                    onClick={() => updateProgress(c.id)}
                    style={{ width: "100%", marginTop: "0.75rem", background: "var(--accent)" }}
                  >
                    ✅ Log Progress
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All challenges */}
      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>All Challenges</h2>
      <div className="card-grid">
        {allChallenges.map(c => {
          const isCompleted = completedIds.has(c.id);
          const isActive = myChallenges.find(mc => mc.id === c.id && mc.status === "active");
          const Icon = ICONS[c.icon] || Trophy;
          const mc = myChallenges.find(m => m.id === c.id);

          return (
            <div key={c.id} className="card" style={{
              border: isCompleted ? "2px solid var(--primary)" :
                isActive ? "2px solid var(--accent)" : "1px solid var(--border)",
              opacity: isCompleted ? 0.85 : 1,
            }}>
              {/* Completed ribbon */}
              {isCompleted && (
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: "var(--primary)", color: "white",
                  padding: "3px 12px", fontSize: "0.72rem", fontWeight: 800,
                  borderRadius: "0 var(--radius-lg) 0 8px",
                }}>
                  DONE ✓
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "14px", flexShrink: 0,
                  background: isCompleted ? "#dcfce7" : isActive ? "var(--accent-light)" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={24} color={isCompleted ? "var(--primary)" : isActive ? "var(--accent)" : "var(--text-muted)"} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>{c.title}</h3>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>{c.description}</p>
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span className="badge badge-green">+{c.reward} pts</span>
                <span className="badge badge-gray">
                  <Users size={11} /> ~200 doing this
                </span>
              </div>

              {/* Progress if active */}
              {isActive && mc && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <ChallengeHeatmap progress={mc.progress} target={c.target} />
                </div>
              )}

              {/* CTA */}
              {isCompleted ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: 700, fontSize: "0.9rem" }}>
                  <CheckCircle size={18} /> Challenge Completed!
                </div>
              ) : isActive ? (
                <button
                  onClick={() => updateProgress(c.id)}
                  style={{ width: "100%", background: "var(--accent)", fontSize: "0.9rem" }}
                >
                  ✅ Log Progress
                </button>
              ) : (
                <button
                  onClick={() => joinChallenge(c.id)}
                  className="btn-ghost"
                  style={{ width: "100%", fontSize: "0.9rem" }}
                >
                  <Plus size={16} /> Join Challenge
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
