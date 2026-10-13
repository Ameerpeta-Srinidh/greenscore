import { useEffect, useState } from "react";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { apiRequest } from "./api";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

const emptyDashboard = {
  totalEntries: 0,
  averageScore: 0,
  latestTotal: 0,
  totalEmissions: 0,
  breakdownTotals: {
    transport: 0,
    electricity: 0,
    food: 0,
  },
  weeklyTrend: [],
  recommendation: "Add your first footprint entry to unlock the dashboard.",
};

function loadStoredUser() {
  try {
    const raw = localStorage.getItem("greenscorePremiumUser");
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

export default function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "Eco User",
    email: "eco@example.com",
    password: "password123",
  });
  const [entryForm, setEntryForm] = useState({
    transport: 18,
    electricity: 6,
    food: 2,
  });
  const [token, setToken] = useState(() => localStorage.getItem("greenscorePremiumToken") || "");
  const [user, setUser] = useState(loadStoredUser);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [entries, setEntries] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (activeToken) => {
    const [dashboardData, entriesData] = await Promise.all([
      apiRequest("/dashboard", { token: activeToken }),
      apiRequest("/entries", { token: activeToken }),
    ]);

    setDashboard({ ...emptyDashboard, ...dashboardData });
    setEntries(entriesData.entries || []);
  };

  useEffect(() => {
    if (!token) {
      setDashboard(emptyDashboard);
      setEntries([]);
      return;
    }

    loadDashboard(token).catch((loadError) => {
      setError(loadError.message);
    });
  }, [token]);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  };

  const handleEntryChange = (event) => {
    const { name, value } = event.target;
    setEntryForm((current) => ({ ...current, [name]: Number(value) || 0 }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : authForm;

      const data = await apiRequest(path, {
        method: "POST",
        body: payload,
      });

      localStorage.setItem("greenscorePremiumToken", data.token);
      localStorage.setItem("greenscorePremiumUser", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEntrySubmit = async (event) => {
    event.preventDefault();
    setEntryLoading(true);
    setError("");

    try {
      await apiRequest("/entries", {
        method: "POST",
        body: entryForm,
        token,
      });

      await loadDashboard(token);
    } catch (entryError) {
      setError(entryError.message);
    } finally {
      setEntryLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("greenscorePremiumToken");
    localStorage.removeItem("greenscorePremiumUser");
    setToken("");
    setUser(null);
    setError("");
  };

  const doughnutData = {
    labels: ["Transport", "Electricity", "Food"],
    datasets: [
      {
        data: [
          dashboard.breakdownTotals.transport,
          dashboard.breakdownTotals.electricity,
          dashboard.breakdownTotals.food,
        ],
        backgroundColor: ["#166534", "#22c55e", "#86efac"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: dashboard.weeklyTrend.map((entry) => entry.label),
    datasets: [
      {
        label: "Daily footprint",
        data: dashboard.weeklyTrend.map((entry) => entry.total),
        borderColor: "#166534",
        backgroundColor: "rgba(34, 197, 94, 0.18)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">GreenScore Premium</p>
          <h1>Login or create an account to save your footprint history.</h1>
          <p className="muted">
            Premium keeps entries in MongoDB, adds authentication, and shows a richer
            dashboard without making the codebase hard to follow.
          </p>

          <div className="auth-toggle">
            <button
              className={authMode === "login" ? "active" : ""}
              type="button"
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              className={authMode === "signup" ? "active" : ""}
              type="button"
              onClick={() => setAuthMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="stack" onSubmit={handleAuthSubmit}>
            {authMode === "signup" ? (
              <label>
                Name
                <input
                  name="name"
                  type="text"
                  value={authForm.name}
                  onChange={handleAuthChange}
                />
              </label>
            ) : null}

            <label>
              Email
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={handleAuthChange}
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={handleAuthChange}
              />
            </label>

            <button className="primary" type="submit" disabled={authLoading}>
              {authLoading ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          {error ? <p className="error">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="eyebrow">GreenScore Premium</p>
          <h1>Welcome back, {user?.name || "User"}.</h1>
          <p className="muted">{dashboard.recommendation}</p>
        </div>

        <button className="ghost" type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="summary-grid">
        <article className="summary-card standout">
          <span>Average score</span>
          <strong>{dashboard.averageScore}</strong>
          <small>Across saved entries</small>
        </article>

        <article className="summary-card">
          <span>Latest total</span>
          <strong>{dashboard.latestTotal.toFixed(1)} kg</strong>
        </article>

        <article className="summary-card">
          <span>Total entries</span>
          <strong>{dashboard.totalEntries}</strong>
        </article>

        <article className="summary-card">
          <span>Total emissions tracked</span>
          <strong>{dashboard.totalEmissions.toFixed(1)} kg</strong>
        </article>
      </section>

      <section className="content-grid">
        <form className="panel stack" onSubmit={handleEntrySubmit}>
          <div>
            <h2>Add today&apos;s entry</h2>
            <p className="muted">Save one simple footprint log to update the dashboard.</p>
          </div>

          <label>
            Transport (km)
            <input
              min="0"
              name="transport"
              type="number"
              value={entryForm.transport}
              onChange={handleEntryChange}
            />
          </label>

          <label>
            Electricity (kWh)
            <input
              min="0"
              name="electricity"
              type="number"
              value={entryForm.electricity}
              onChange={handleEntryChange}
            />
          </label>

          <label>
            Food (high-impact meals)
            <input
              min="0"
              name="food"
              type="number"
              value={entryForm.food}
              onChange={handleEntryChange}
            />
          </label>

          <button className="primary" type="submit" disabled={entryLoading}>
            {entryLoading ? "Saving..." : "Save entry"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>

        <div className="dashboard-grid">
          <article className="panel chart-card">
            <h2>Emissions mix</h2>
            <Doughnut data={doughnutData} />
          </article>

          <article className="panel chart-card wide">
            <h2>Recent trend</h2>
            <Line
              data={lineData}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </article>

          <article className="panel wide">
            <h2>Recent entries</h2>
            <div className="entry-list">
              {entries.length ? (
                entries.map((entry) => (
                  <div className="entry-row" key={entry._id}>
                    <div>
                      <strong>{new Date(entry.createdAt).toLocaleDateString()}</strong>
                      <small>
                        {entry.transport} km transport, {entry.electricity} kWh electricity,{" "}
                        {entry.food} food
                      </small>
                    </div>
                    <span>{entry.total.toFixed(1)} kg</span>
                  </div>
                ))
              ) : (
                <p className="muted">No saved entries yet.</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
