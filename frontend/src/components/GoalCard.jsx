import { useEffect, useState } from "react";
import { api } from "../api";

export default function GoalCard({ userId, totalCarbon }) {
  const month = new Date().toISOString().slice(0, 7);
  const [target, setTarget] = useState("");
  const [savedGoal, setSavedGoal] = useState(null);

  const loadGoal = async () => {
    const res = await api.get(`/goals/${userId}/${month}`);
    setSavedGoal(res.data);
  };

  useEffect(() => {
    if (userId) {
      loadGoal();
    }
  }, [userId, month]);

  const saveGoal = async () => {
    const res = await api.post("/goals", {
      userId,
      month,
      targetKg: Number(target)
    });
    setSavedGoal(res.data);
    setTarget("");
  };

  if (!savedGoal) {
    return (
      <div className="card">
        <h3>Set Monthly Carbon Goal</h3>
        <input
          placeholder="e.g. 20 kg"
          value={target}
          onChange={e => setTarget(e.target.value)}
        />
        <button onClick={saveGoal}>Save Goal</button>
      </div>
    );
  }

  const percent = savedGoal.targetKg > 0
    ? Math.min(100, (totalCarbon / savedGoal.targetKg) * 100)
    : 0;

  const status =
    percent < 70 ? "On Track" :
      percent < 100 ? "At Risk" :
        "Exceeded";

  return (
    <div className="card">
      <h3>Monthly Goal</h3>
      <p><b>Target:</b> {savedGoal.targetKg} kg</p>
      <p><b>Used:</b> {totalCarbon.toFixed(2)} kg</p>

      <div style={{ background: "#e5e7eb", borderRadius: 6 }}>
        <div
          style={{
            width: `${percent}%`,
            height: 10,
            borderRadius: 6,
            background:
              percent < 70 ? "#16a34a" :
                percent < 100 ? "#f59e0b" :
                  "#dc2626"
          }}
        />
      </div>

      <p>Status: <b>{status}</b></p>
    </div>
  );
}
