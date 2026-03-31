/**
 * BudgetGauge.jsx
 * Shows monthly CO₂ against the Paris Agreement personal budget.
 * Includes animated semicircle gauge, status, and "days until exhausted" projection.
 */

import { getBudgetStatus, MONTHLY_BUDGET_KG } from "../utils/carbonContext";

export default function BudgetGauge({ monthlyKg = 0, daysLogged = 30 }) {
  const { percent, label, color, message } = getBudgetStatus(monthlyKg);

  // Needle angle: 0 kg → -90deg, budget → 0deg, 2x budget → +90deg
  const needleAngle = Math.min(Math.max((percent / 100) * 180 - 90, -88), 88);

  // Project when budget will be exhausted
  const dailyRate = daysLogged > 0 ? monthlyKg / daysLogged : 0;
  const daysLeft = dailyRate > 0 ? Math.max(0, (MONTHLY_BUDGET_KG - monthlyKg) / dailyRate) : null;
  const budgetExhaustedOn = daysLeft !== null && daysLeft > 0
    ? new Date(Date.now() + daysLeft * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null;

  const remaining = Math.max(0, MONTHLY_BUDGET_KG - monthlyKg);

  return (
    <div className="card card-accent" style={{ textAlign: "center" }}>
      <h3 style={{ marginBottom: "0.25rem" }}>🌍 Climate Budget</h3>
      <p style={{ marginBottom: "1.25rem", fontSize: "0.85rem" }}>
        Paris Agreement target: <strong>{MONTHLY_BUDGET_KG} kg</strong>/month
      </p>

      {/* Gauge */}
      <div className="budget-gauge-wrap" style={{ margin: "0 auto 0.75rem" }}>
        <div className="budget-gauge-bg" />
        <div className="budget-gauge-mask" />
        <div
          className="budget-gauge-needle"
          style={{ transform: `translateX(-50%) rotate(${needleAngle}deg)` }}
        />
      </div>

      {/* Status badge */}
      <div style={{ marginBottom: "0.75rem" }}>
        <span className="badge" style={{ background: color + "22", color }}>
          {label}
        </span>
      </div>

      {/* Numbers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.75rem",
        marginBottom: "0.75rem",
      }}>
        <div className="stat-card" style={{ textAlign: "center" }}>
          <div className="stat-label">Used</div>
          <div className="stat-value" style={{ color, fontSize: "1.5rem" }}>
            {monthlyKg.toFixed(1)}
          </div>
          <div className="stat-sub">kg so far</div>
        </div>
        <div className="stat-card" style={{ textAlign: "center" }}>
          <div className="stat-label">Remaining</div>
          <div className="stat-value" style={{ color: remaining === 0 ? "var(--danger)" : "var(--primary)", fontSize: "1.5rem" }}>
            {remaining > 0 ? remaining.toFixed(1) : "Over!"}
          </div>
          <div className="stat-sub">kg left</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap" style={{ marginBottom: "0.75rem" }}>
        <div
          className={`progress-bar-fill ${percent > 100 ? "danger" : ""}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <p style={{ fontSize: "0.85rem", margin: 0 }}>{message}</p>

      {budgetExhaustedOn && remaining > 0 && (
        <p style={{ fontSize: "0.8rem", color: "var(--warning)", marginTop: "0.5rem", fontWeight: 600 }}>
          ⚠️ Budget exhausted by: <strong>{budgetExhaustedOn}</strong> at current pace
        </p>
      )}
    </div>
  );
}
