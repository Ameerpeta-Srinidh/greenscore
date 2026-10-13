/**
 * EmissionFactors.jsx
 * Browsable Indian emission factor reference library.
 */

import { useState, useEffect } from "react";
import { api } from "../api";
import { Book, Zap, Car, UtensilsCrossed, Search, MapPin } from "lucide-react";

export default function EmissionFactors() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("electricity");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/dashboard/reference/emission-factors");
        setData(res.data);
      } catch (e) {
        console.error("Failed to load emission factors", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="container">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-lg)", marginBottom: "1rem" }} />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container">
        <p>Failed to load emission factors.</p>
      </div>
    );
  }

  const tabs = [
    { id: "electricity", label: "⚡ Electricity", icon: Zap },
    { id: "transport", label: "🚗 Transport", icon: Car },
    { id: "food", label: "🍽️ Food", icon: UtensilsCrossed },
  ];

  const filterItems = (items) => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(i =>
      (i.label || "").toLowerCase().includes(s) ||
      (i.value || "").toLowerCase().includes(s)
    );
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          padding: "12px", borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
        }}>
          <Book size={24} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Emission Factor Library</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Indian-specific factors from CEA India, IPCC AR6 & GHG Protocol
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          placeholder="Search factors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "" : "btn-ghost"}
            style={{
              fontSize: "0.85rem", padding: "0.5rem 1rem",
              background: activeTab === tab.id ? "var(--primary)" : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Electricity Grid */}
      {activeTab === "electricity" && (
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={18} color="var(--primary)" /> State-wise Electricity Emission Factors
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Source: Central Electricity Authority (CEA) India — CO₂ Baseline Database v18
          </p>
          <div className="ef-grid">
            {filterItems(data.states || []).map((s, i) => (
              <div key={i} className="ef-card">
                <div className="ef-card-header">
                  <span className="ef-card-name">{s.label}</span>
                  <span className="ef-card-value" style={{
                    color: s.factor < 0.5 ? "#10b981" : s.factor < 0.85 ? "#f59e0b" : "#ef4444"
                  }}>
                    {s.factor} <small>kg/kWh</small>
                  </span>
                </div>
                <div className="ef-bar-track">
                  <div className="ef-bar" style={{
                    width: `${Math.min((s.factor / 1.1) * 100, 100)}%`,
                    background: s.factor < 0.5 ? "#10b981" : s.factor < 0.85 ? "#f59e0b" : "#ef4444",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transport */}
      {activeTab === "transport" && (
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Car size={18} color="var(--primary)" /> Transport Emission Factors
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Includes Indian-specific modes: auto-rickshaw, two-wheeler, metro, e-rickshaw
          </p>
          <table className="ef-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Emission Factor</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody>
              {filterItems(data.transportModes || []).map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{m.label}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: m.factor === 0 ? "#10b981" : m.factor < 0.05 ? "#34d399" : m.factor < 0.15 ? "#f59e0b" : "#ef4444"
                    }}>
                      {m.factor} kg/km
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${m.scope === 1 ? "red" : m.scope === 2 ? "blue" : "purple"}`}>
                      Scope {m.scope}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Food */}
      {activeTab === "food" && (
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UtensilsCrossed size={18} color="var(--primary)" /> Food Emission Factors
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Indian food items with per-meal/serving emissions
          </p>
          <table className="ef-table">
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Emission Factor</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody>
              {filterItems(data.foodTypes || []).map((f, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{f.label}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: f.factor < 1 ? "#10b981" : f.factor < 3 ? "#f59e0b" : "#ef4444"
                    }}>
                      {f.factor} kg/serving
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-purple">Scope {f.scope}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Attribution */}
      <div style={{
        marginTop: "1.5rem", padding: "1rem", borderRadius: "12px",
        background: "#f8fafc", border: "1px solid var(--border)",
        fontSize: "0.8rem", color: "var(--text-muted)",
      }}>
        <strong>Sources:</strong> Central Electricity Authority (CEA) India CO₂ Baseline Database v18,
        IPCC Sixth Assessment Report (AR6), GHG Protocol Corporate Standard,
        Indian Railways Sustainability Report, TERI Energy Data Directory.
      </div>
    </div>
  );
}
