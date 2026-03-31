import { useEffect, useState } from "react";
import { api } from "../api";
import { getCarbonEquivalentShort, TYPE_ICONS, TYPE_CLASS } from "../utils/carbonContext";
import { Trash2 } from "lucide-react";

export default function ActivityHistory({ userId, refreshTrigger, onActivityDeleted }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/activity/user/${userId}`)
      .then(res => setActivities(res.data))
      .catch(err => console.error("Failed to load history", err))
      .finally(() => setLoading(false));
  }, [userId, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this activity?")) return;
    try {
      await api.delete(`/activity/${id}`);
      setActivities(prev => prev.filter(a => a._id !== id));
      if (onActivityDeleted) onActivityDeleted();
    } catch {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3>📜 Recent Activities</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 56, marginBottom: "0.5rem" }} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🌱</div>
        <h3>No activities yet</h3>
        <p>Tap the <strong>+</strong> button to log your first activity!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "1rem" }}>📜 Recent Activities</h3>
      <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: "0.25rem" }}>
        {activities.map(a => {
          const typeKey = (a.type || "other").toLowerCase();
          const icon = TYPE_ICONS[typeKey] || "📦";
          const iconClass = TYPE_CLASS[typeKey] || "other";
          const equiv = getCarbonEquivalentShort(a.carbonKg);
          const date = new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

          return (
            <div key={a._id} className="activity-item">
              {/* Icon */}
              <div className={`activity-icon activity-icon-${iconClass}`}>
                {icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.rawText}
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.2rem", alignItems: "center" }}>
                  <span className="badge badge-red" style={{ fontSize: "0.72rem" }}>
                    {a.carbonKg.toFixed(2)} kg CO₂
                  </span>
                  {equiv && <span className="equiv-chip">{equiv}</span>}
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{date}</span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(a._id)}
                className="btn-ghost btn-sm"
                style={{ borderRadius: "50%", width: 32, height: 32, padding: 0, flexShrink: 0, border: "none" }}
                title="Delete"
              >
                <Trash2 size={15} color="var(--text-light)" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
