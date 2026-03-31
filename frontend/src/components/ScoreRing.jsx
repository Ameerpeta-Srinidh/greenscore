/**
 * ScoreRing.jsx
 * Animated SVG ring that visualizes GreenScore 0–100.
 */

export default function ScoreRing({ score = 0, size = 120 }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = c - pct * c;

  const color =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#34d399" :
    score >= 40 ? "#f59e0b" :
    score >= 20 ? "#f97316" :
    "#ef4444";

  const label =
    score >= 80 ? "Excellent" :
    score >= 60 ? "Good" :
    score >= 40 ? "Fair" :
    score >= 20 ? "Poor" :
    "Critical";

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Track */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1), stroke 0.5s ease" }}
        />
      </svg>
      <div className="score-ring-center">
        <div className="score-ring-value" style={{ color }}>
          {Math.round(score)}
        </div>
        <div className="score-ring-label">{label}</div>
      </div>
    </div>
  );
}
