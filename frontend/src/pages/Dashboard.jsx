import { useEffect, useState } from "react";
import { api } from "../api";
import AddActivity from "../components/AddActivity";
import GoalCard from "../components/GoalCard";
import ActivityHistory from "../components/ActivityHistory";
import CarbonForest from "../components/CarbonForest";
import {
  Leaf,
  Trophy,
  Zap,
  TrendingUp,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
);

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const userId = auth?.userId;
  const [data, setData] = useState(null);
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/${userId}?range=${range}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboard();
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (userId) {
      loadDashboard();
    }
  }, [range, userId]);

  if (loading || !data) {
    return <div className="container">Loading dashboard...</div>;
  }

  const {
    totalCarbon,
    count,
    breakdown = {},
    daily = {},
    suggestions = []
  } = data;

  return (
    <div className="container">
      {/* Header removed (handled by Layout) */}

      {/* Time Range Selector */}

      {/* Time Range Selector */}
      <div className="card">
        <label>
          <b>Time Range:</b>{" "}
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </label>
      </div>

      {/* Overview */}
      <div className="card">
        <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <TrendingUp size={24} color="#2563eb" /> Overview
        </h2>
        <div style={{ marginTop: "15px" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
            <b>Total Carbon:</b> <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626" }}>{totalCarbon.toFixed(2)}</span> kg CO₂
          </p>
          <p><b>Activities Logged:</b> {count}</p>
          {data.greenScore !== undefined && (
            <p style={{ marginTop: "10px" }}>
              <b>GreenScore:</b>
              <span style={{
                marginLeft: "10px",
                padding: "4px 12px",
                borderRadius: "20px",
                background: "#dcfce7",
                color: "#166534",
                fontWeight: "bold"
              }}>
                {data.greenScore.toFixed(0)}/100
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Goal Tracking */}
      <GoalCard userId={userId} totalCarbon={totalCarbon} />

      {/* Carbon Forest (Visual Reward) */}
      {data.greenScore !== undefined && (
        <CarbonForest score={data.greenScore} />
      )}

      {/* NEW: Activity History */}
      <ActivityHistory
        userId={userId}
        refreshTrigger={refreshKey}
        onActivityDeleted={handleRefresh}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginTop: "20px" }}>

        {/* Breakdown Chart */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3>Emission Breakdown</h3>
          {Object.keys(breakdown).length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <div style={{ height: "250px", width: "100%", display: "flex", justifyContent: "center" }}>
              <Pie
                data={{
                  labels: Object.keys(breakdown),
                  datasets: [
                    {
                      data: Object.values(breakdown),
                      backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"]
                    }
                  ]
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div className="card">
          <h3>Emissions Over Time</h3>
          {Object.keys(daily).length === 0 ? (
            <p>No trend data.</p>
          ) : (
            <div style={{ height: "250px", width: "100%" }}>
              <Line
                data={{
                  labels: Object.keys(daily),
                  datasets: [
                    {
                      label: "kg CO₂",
                      data: Object.values(daily),
                      borderColor: "#2563eb",
                      tension: 0.3
                    }
                  ]
                }}
                options={{ maintainAspectRatio: false, responsive: true }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="card" style={{ marginTop: "20px", borderLeft: "4px solid #f59e0b" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Zap size={24} color="#f59e0b" /> Smart Insights
          </h3>
          <ul style={{ textAlign: "left", paddingLeft: "1.5rem", marginTop: "10px" }}>
            {suggestions.map((suggestion, idx) => (
              <li key={idx} style={{ marginBottom: "0.8rem", lineHeight: "1.5" }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Activity */}
      <AddActivity userId={userId} onAdded={handleRefresh} />
    </div>
  );
}
