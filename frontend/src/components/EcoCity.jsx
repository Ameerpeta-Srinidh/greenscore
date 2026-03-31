/**
 * EcoCity.jsx — Replaces the old CarbonForest.
 * A living, animated city that transforms based on GreenScore.
 *
 * Stage 0–20:  Industrial wasteland (grey, smoky chimneys)
 * Stage 21–40: Concrete city (no greenery, grey)
 * Stage 41–60: Urban parks appearing (some green)
 * Stage 61–80: Green city (solar panels, trees)
 * Stage 81–100: Eco-utopia (thriving, animated birds)
 */

import { useEffect, useState } from "react";

const STAGES = [
  {
    range: [0, 20],
    label: "Industrial Wasteland",
    emoji: "🏭",
    sky: "linear-gradient(to bottom, #78716c, #a8a29e)",
    ground: "#57534e",
    buildings: [
      { w: 40, h: 80, color: "#44403c" },
      { w: 60, h: 110, color: "#3d3837" },
      { w: 35, h: 60, color: "#44403c" },
      { w: 50, h: 90, color: "#292524" },
      { w: 45, h: 70, color: "#3d3837" },
      { w: 55, h: 100, color: "#44403c" },
      { w: 40, h: 55, color: "#292524" },
    ],
    particles: { color: "#94a3b8", count: 8, symbol: "💨" },
    tip: "Start logging eco-friendly activities to transform your city!",
  },
  {
    range: [21, 40],
    label: "Concrete City",
    emoji: "🏙️",
    sky: "linear-gradient(to bottom, #93c5fd, #bfdbfe)",
    ground: "#6b7280",
    buildings: [
      { w: 40, h: 90, color: "#9ca3af" },
      { w: 60, h: 130, color: "#6b7280" },
      { w: 35, h: 75, color: "#9ca3af" },
      { w: 55, h: 110, color: "#4b5563" },
      { w: 45, h: 85, color: "#9ca3af" },
      { w: 50, h: 105, color: "#6b7280" },
      { w: 38, h: 65, color: "#4b5563" },
    ],
    particles: [],
    tip: "Try cycling or public transport to green up your city!",
  },
  {
    range: [41, 60],
    label: "Urban Parks Emerging",
    emoji: "🌿",
    sky: "linear-gradient(to bottom, #7dd3fc, #bae6fd)",
    ground: "#4ade80",
    buildings: [
      { w: 38, h: 80, color: "#86efac" },
      { w: 55, h: 120, color: "#6b7280" },
      { w: 32, h: 60, color: "#86efac" },
      { w: 50, h: 100, color: "#4ade80" },
      { w: 42, h: 75, color: "#86efac" },
      { w: 48, h: 95, color: "#6b7280" },
      { w: 35, h: 55, color: "#86efac" },
    ],
    particles: { color: "#86efac", count: 4, symbol: "🍃" },
    tip: "Great progress! Add meat-free meals to keep improving.",
  },
  {
    range: [61, 80],
    label: "Green City",
    emoji: "🌳",
    sky: "linear-gradient(to bottom, #38bdf8, #7dd3fc)",
    ground: "#22c55e",
    buildings: [
      { w: 38, h: 85, color: "#4ade80" },
      { w: 55, h: 115, color: "#16a34a" },
      { w: 30, h: 65, color: "#4ade80" },
      { w: 50, h: 105, color: "#15803d" },
      { w: 42, h: 80, color: "#4ade80" },
      { w: 48, h: 100, color: "#16a34a" },
      { w: 35, h: 60, color: "#4ade80" },
    ],
    particles: { color: "#86efac", count: 6, symbol: "🌿" },
    tip: "Solar panels are appearing! Almost at eco-utopia.",
  },
  {
    range: [81, 100],
    label: "🌏 Eco-Utopia",
    emoji: "🌏",
    sky: "linear-gradient(to bottom, #0ea5e9, #38bdf8)",
    ground: "#16a34a",
    buildings: [
      { w: 36, h: 80, color: "#4ade80" },
      { w: 52, h: 118, color: "#15803d" },
      { w: 28, h: 62, color: "#34d399" },
      { w: 48, h: 108, color: "#059669" },
      { w: 40, h: 78, color: "#4ade80" },
      { w: 46, h: 98, color: "#15803d" },
      { w: 32, h: 58, color: "#34d399" },
    ],
    particles: { color: "#fbbf24", count: 10, symbol: "🐦" },
    tip: "You've built an eco-utopia! You're a climate champion! 🏆",
  },
];

function getStage(score) {
  return STAGES.find(s => score >= s.range[0] && score <= s.range[1]) || STAGES[0];
}

export default function EcoCity({ score = 0 }) {
  const stage = getStage(Math.round(score));
  const [particles, setParticles] = useState([]);
  const prevStageIndex = STAGES.findIndex(s => score >= s.range[0] && score <= s.range[1]);

  useEffect(() => {
    if (!stage.particles || !stage.particles.count) return;
    const ps = Array.from({ length: stage.particles.count }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${40 + Math.random() * 40}%`,
      delay: `${Math.random() * 3}s`,
      size: 14 + Math.random() * 10,
    }));
    setParticles(ps);
  }, [stage]);

  const pct = ((score - stage.range[0]) / (stage.range[1] - stage.range[0] + 1)) * 100;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* City Scene */}
      <div
        className="eco-city-stage"
        style={{ background: stage.sky }}
      >
        {/* Animated Particles */}
        {particles.map(p => (
          <span
            key={p.id}
            className="eco-particle"
            style={{
              left: p.left,
              top: p.top,
              fontSize: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {stage.particles.symbol}
          </span>
        ))}

        {/* Buildings */}
        <div className="eco-city-buildings">
          {stage.buildings.map((b, i) => (
            <div
              key={i}
              className="eco-building"
              style={{
                width: b.w,
                height: b.h,
                background: b.color,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Window lights on tallest buildings */}
              {b.h > 90 && (
                <div style={{
                  position: "absolute",
                  top: 6, left: 6, right: 6,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 3,
                }}>
                  {Array.from({ length: 6 }).map((_, wi) => (
                    <div key={wi} style={{
                      height: 5, borderRadius: 1,
                      background: score > 60 ? "#fef08a" : "rgba(255,255,255,0.2)",
                      opacity: 0.7,
                    }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ground */}
        <div className="eco-city-ground" style={{ background: stage.ground }} />

        {/* Stage Label */}
        <div style={{
          position: "absolute",
          top: 12, left: 16,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          color: "white",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.8rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          {stage.emoji} {stage.label}
        </div>

        {/* Score inside city */}
        <div style={{
          position: "absolute",
          top: 12, right: 16,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          color: "white",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: "0.85rem",
          fontWeight: 800,
        }}>
          🌿 {score.toFixed(0)}/100
        </div>
      </div>

      {/* Info Panel */}
      <div style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Stage Progress</span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {prevStageIndex < STAGES.length - 1
              ? `Next: ${STAGES[Math.min(prevStageIndex + 1, STAGES.length - 1)].label}`
              : "Max stage reached! 🏆"}
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {stage.tip}
        </p>
      </div>
    </div>
  );
}
