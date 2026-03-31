/**
 * CoachPanel.jsx
 * AI Eco-Coach with memory, personalized insights, and a what-if calculator.
 * Uses existing /dashboard data — no new backend endpoint needed.
 */

import { useState } from "react";
import { api } from "../api";
import { getCarbonEquivalentShort, getWhatIfSaving } from "../utils/carbonContext";
import { Sparkles, Calculator, ChevronRight } from "lucide-react";

const WHAT_IF_EXAMPLES = [
  { label: "Cycle instead of driving 10 km", activityKg: 2.1, altKg: 0.0 },
  { label: "Bus instead of car (10 km)", activityKg: 2.1, altKg: 0.82 },
  { label: "Plant-based meal instead of beef", activityKg: 6.8, altKg: 0.4 },
  { label: "Train instead of domestic flight", activityKg: 45, altKg: 6 },
  { label: "LED bulbs (10w vs 60w, 8h/day)", activityKg: 0.18, altKg: 0.03 },
];

function getPersonalizedMessage(breakdown = {}, totalCarbon = 0) {
  if (totalCarbon === 0) {
    return "Hey! I'm your Eco-Coach 🌱 Start logging activities and I'll give you personalised insights based on your actual emissions.";
  }

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return "Log some activities so I can give you tailored advice!";

  const [topType, topKg] = entries[0];
  const topPct = ((topKg / totalCarbon) * 100).toFixed(0);

  const messages = {
    travel: `Your #1 emission source is **travel** (${topPct}% of your footprint). Even switching 2 days/week to public transport could cut this by ~40%. Want to see the numbers? Use the What-If Calculator below 👇`,
    food: `**Food** is driving ${topPct}% of your carbon footprint. Swapping just 3 beef meals/week for plant-based options saves ~60 kg CO₂ over a month — that's like unplanting 3 trees. Let's make it count 🌱`,
    electricity: `**Electricity** is your biggest carbon drain at ${topPct}%. Shifting heavy appliances to off-peak hours and using LED lighting can cut this by 20-30% with zero lifestyle change ⚡`,
    shopping: `**Shopping** contributes ${topPct}% of your footprint. Buying second-hand or choosing 1 fewer online delivery per week saves more than you'd think 🛍️`,
    other: `Your emissions are spread across categories. Focus on reducing your top activities first — consistency matters more than perfection!`,
  };

  return messages[topType] || messages.other;
}

export default function CoachPanel({ breakdown = {}, totalCarbon = 0, suggestions = [] }) {
  const [activeTab, setActiveTab] = useState("insights");
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [customActivity, setCustomActivity] = useState("");
  const [customAlt, setCustomAlt] = useState("");
  const [loadingCustom, setLoadingCustom] = useState(false);

  const message = getPersonalizedMessage(breakdown, totalCarbon);

  const handlePreset = (preset) => {
    const result = getWhatIfSaving(preset.activityKg, preset.altKg);
    setWhatIfResult({ ...result, label: preset.label });
  };

  const handleCustomWhatIf = async () => {
    if (!customActivity.trim() || !customAlt.trim()) return;
    setLoadingCustom(true);
    try {
      // Parse both activities via AI
      const [r1, r2] = await Promise.all([
        api.post("/activity/ai-text", { userId: "parse-only", text: customActivity }).catch(() => null),
        api.post("/activity/ai-text", { userId: "parse-only", text: customAlt }).catch(() => null),
      ]);
      const kg1 = r1?.data?.parsedData?.carbon_kg || 0;
      const kg2 = r2?.data?.parsedData?.carbon_kg || 0;
      const result = getWhatIfSaving(kg1, kg2);
      setWhatIfResult({ ...result, label: `"${customActivity}" → "${customAlt}"` });
    } catch {
      setWhatIfResult({ savedKg: "?", annualKg: "?", equiv: null, label: "Could not parse activities" });
    } finally {
      setLoadingCustom(false);
    }
  };

  return (
    <div className="card card-accent" style={{ borderColor: "#a5b4fc", borderTopColor: "var(--accent)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div className="coach-avatar">🤖</div>
        <div>
          <h3 style={{ margin: 0, color: "var(--accent)" }}>Eco-Coach</h3>
          <p style={{ margin: 0, fontSize: "0.8rem" }}>Your personal AI climate advisor</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {[
          { id: "insights", label: "💡 Insights", icon: Sparkles },
          { id: "whatif", label: "🔢 What-If", icon: Calculator },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "" : "btn-ghost"}
            style={{
              fontSize: "0.85rem",
              padding: "0.45rem 1rem",
              background: activeTab === tab.id ? "var(--accent)" : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "insights" && (
        <div>
          {/* Main coach message (supports **bold**) */}
          <div className="coach-bubble">
            {message.split(/\*\*(.*?)\*\*/g).map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </div>

          {/* AI suggestions as chips */}
          {suggestions.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>
                🎯 Action Items
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {suggestions.slice(0, 3).map((tip, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "0.65rem 0.9rem",
                    background: "#f5f3ff",
                    borderRadius: "10px",
                    border: "1px solid #e9d5ff",
                    fontSize: "0.88rem",
                    color: "#4c1d95",
                  }}>
                    <ChevronRight size={14} style={{ flexShrink: 0, marginTop: 2, color: "var(--accent)" }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "whatif" && (
        <div>
          <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
            Compare two activities to see exactly how much CO₂ you'd save.
          </p>

          {/* Preset scenarios */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
              Quick Scenarios
            </p>
            {WHAT_IF_EXAMPLES.map((p, i) => (
              <button
                key={i}
                className="btn-ghost"
                style={{ justifyContent: "flex-start", fontSize: "0.85rem", borderRadius: "8px", textAlign: "left" }}
                onClick={() => handlePreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom input (uses AI parse) */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Custom (AI-powered)
            </p>
            <input
              placeholder="Current activity: e.g. drove 20km to work"
              value={customActivity}
              onChange={e => setCustomActivity(e.target.value)}
              style={{ marginBottom: "0.5rem" }}
            />
            <input
              placeholder="Alternative: e.g. cycled 20km to work"
              value={customAlt}
              onChange={e => setCustomAlt(e.target.value)}
              style={{ marginBottom: "0.75rem" }}
            />
            <button onClick={handleCustomWhatIf} disabled={loadingCustom} style={{ width: "100%", background: "var(--accent)" }}>
              {loadingCustom ? "Calculating..." : "🔢 Calculate Savings"}
            </button>
          </div>

          {/* Result */}
          {whatIfResult && (
            <div className="what-if-result">
              <p style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-main)" }}>
                📊 {whatIfResult.label}
              </p>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>Per trip saved:</strong>{" "}
                <span style={{ color: "var(--primary)", fontWeight: 800 }}>
                  {whatIfResult.savedKg} kg CO₂
                </span>
              </p>
              {whatIfResult.equiv && (
                <p style={{ marginBottom: "0.25rem" }}>
                  <strong>That's like:</strong> {whatIfResult.equiv.emoji} {whatIfResult.equiv.text}
                </p>
              )}
              <p>
                <strong>Annually (×52):</strong>{" "}
                <span style={{ color: "var(--primary)", fontWeight: 800 }}>
                  {whatIfResult.annualKg} kg CO₂
                </span>{" "}
                saved per year
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
