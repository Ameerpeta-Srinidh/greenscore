/**
 * StreakBadge.jsx
 * Shows the user's current logging streak with a flame animation.
 * Reads streak from localStorage (updated when an activity is logged).
 */

import { useEffect, useState } from "react";

export function getStreak() {
  try {
    const data = JSON.parse(localStorage.getItem("gs_streak") || "{}");
    const lastDate = data.lastDate;
    const streak = data.streak || 0;
    if (!lastDate) return 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === today || lastDate === yesterday) return streak;
    return 0; // broken
  } catch {
    return 0;
  }
}

export function updateStreak() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem("gs_streak") || "{}");
    const lastDate = data.lastDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let newStreak = 1;
    if (lastDate === today) {
      newStreak = data.streak || 1; // already logged today, don't increment
    } else if (lastDate === yesterday) {
      newStreak = (data.streak || 0) + 1; // consecutive day
    }

    localStorage.setItem("gs_streak", JSON.stringify({ streak: newStreak, lastDate: today }));
    return newStreak;
  } catch {
    return 1;
  }
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100];

export default function StreakBadge({ size = "normal" }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    const interval = setInterval(() => setStreak(getStreak()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (streak === 0) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        background: "#f1f5f9", color: "var(--text-muted)",
        padding: "0.35rem 0.8rem", borderRadius: "var(--radius-full)",
        fontSize: size === "small" ? "0.8rem" : "0.9rem", fontWeight: 600,
      }}>
        🔥 Start your streak today!
      </div>
    );
  }

  const nextMilestone = STREAK_MILESTONES.find(m => m > streak);
  const daysToNext = nextMilestone ? nextMilestone - streak : null;
  const milestone = STREAK_MILESTONES.find(m => m === streak);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: size === "small" ? "flex-start" : "center", gap: "0.25rem" }}>
      <div className="streak-badge" style={{ fontSize: size === "small" ? "0.85rem" : "1rem" }}>
        <span className="streak-flame">🔥</span>
        {streak} Day{streak !== 1 ? "s" : ""} Streak
      </div>

      {milestone && (
        <div className="badge badge-yellow" style={{ fontSize: "0.75rem" }}>
          🏆 {milestone}-day milestone!
        </div>
      )}

      {daysToNext && size !== "small" && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
          {daysToNext} more day{daysToNext !== 1 ? "s" : ""} to {nextMilestone}-day badge
        </p>
      )}
    </div>
  );
}
