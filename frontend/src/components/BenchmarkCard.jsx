/**
 * BenchmarkCard.jsx
 * Visual gauge comparing org emissions to industry average.
 */

import { TrendingDown, TrendingUp, Minus, Building2 } from "lucide-react";

export default function BenchmarkCard({ benchmark }) {
  if (!benchmark) return null;

  const { benchmarkKg, perEmployeeKg, diffPercent, label, color, industry, sizeTier } = benchmark;

  const isBelow = diffPercent < 0;
  const isNear = Math.abs(diffPercent) <= 5;
  const absDiff = Math.abs(diffPercent);

  const Icon = isBelow ? TrendingDown : isNear ? Minus : TrendingUp;

  // Progress bar: 0-200% scale where 100% = benchmark
  const ratio = benchmarkKg > 0 ? (perEmployeeKg / benchmarkKg) * 100 : 0;
  const barWidth = Math.min(ratio, 200);

  return (
    <div className="card" style={{ border: `2px solid ${color}22`, position: "relative", overflow: "hidden" }}>
      {/* Accent strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 4, background: color,
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", marginTop: "0.25rem" }}>
        <Building2 size={18} color={color} />
        <h3 style={{ margin: 0 }}>Industry Benchmark</h3>
      </div>

      {/* Main message */}
      <div style={{
        padding: "1rem", borderRadius: "12px",
        background: `${color}0a`, border: `1px solid ${color}22`,
        marginBottom: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Icon size={20} color={color} />
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color }}>
            {isBelow ? `${absDiff}% below` : isNear ? "Near" : `${absDiff}% above`} average
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Your emissions are{" "}
          <strong style={{ color }}>
            {isBelow ? `${absDiff}% below` : isNear ? "right at" : `${absDiff}% above`}
          </strong>{" "}
          the {industry} industry average for {sizeTier}-sized companies.
          {isBelow && " Great job! 🎉"}
          {!isBelow && !isNear && " Consider implementing the suggestions above to reduce your footprint."}
        </p>
      </div>

      {/* Visual gauge */}
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
          <span>Your: {perEmployeeKg} kg/employee</span>
          <span>Avg: {benchmarkKg} kg/employee</span>
        </div>
        <div style={{
          height: 10, background: "#f1f5f9", borderRadius: "999px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Benchmark marker */}
          <div style={{
            position: "absolute", left: "50%", top: -2, bottom: -2,
            width: 2, background: "#64748b", zIndex: 2,
          }} />
          {/* Bar */}
          <div style={{
            height: "100%",
            width: `${Math.min(barWidth / 2, 100)}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: "999px",
            transition: "width 0.8s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          <span>0</span>
          <span>Industry Avg</span>
          <span>2× Avg</span>
        </div>
      </div>

      {/* Label badge */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{
          padding: "0.3rem 1rem", borderRadius: "999px",
          background: `${color}15`, color, fontWeight: 700,
          fontSize: "0.8rem", border: `1px solid ${color}30`,
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}
