import { useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/calculate";

const colors = ["#2d6a4f", "#40916c", "#95d5b2"];

const emptyReport = {
  breakdown: {
    transport: 0,
    electricity: 0,
    food: 0,
  },
  total: 0,
  monthlyEstimate: 0,
  score: 100,
  message: "Enter values and calculate your footprint.",
};

export default function App() {
  const [form, setForm] = useState({
    transport: 20,
    electricity: 7,
    food: 2,
  });
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chartData = {
    labels: ["Transport", "Electricity", "Food"],
    datasets: [
      {
        data: [
          report.breakdown.transport,
          report.breakdown.electricity,
          report.breakdown.food,
        ],
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Today", "Monthly estimate"],
    datasets: [
      {
        label: "kg CO2e",
        data: [report.total, report.monthlyEstimate],
        backgroundColor: ["#2d6a4f", "#74c69d"],
        borderRadius: 14,
      },
    ],
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: Number(value) || 0,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Could not calculate the footprint.");
      }

      const data = await response.json();
      setReport(data);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">GreenScore Pro</p>
          <h1>Simple input form. Product-style dashboard.</h1>
          <p>
            This version keeps one lightweight API for calculations and adds charts so the
            app feels complete without adding backend complexity.
          </p>
        </div>

        <div className="score-card">
          <span>GreenScore</span>
          <strong>{report.score}</strong>
          <small>Higher is better</small>
        </div>
      </section>

      <section className="grid">
        <form className="panel" onSubmit={handleSubmit}>
          <h2>Daily inputs</h2>

          <label>
            Transport (km)
            <input
              min="0"
              name="transport"
              type="number"
              value={form.transport}
              onChange={handleChange}
            />
          </label>

          <label>
            Electricity (kWh)
            <input
              min="0"
              name="electricity"
              type="number"
              value={form.electricity}
              onChange={handleChange}
            />
          </label>

          <label>
            Food (high-impact meals)
            <input
              min="0"
              name="food"
              type="number"
              value={form.food}
              onChange={handleChange}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Calculating..." : "Calculate"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>

        <div className="dashboard">
          <div className="panel stats">
            <div>
              <span>Total today</span>
              <strong>{report.total.toFixed(1)} kg CO2e</strong>
            </div>
            <div>
              <span>Monthly estimate</span>
              <strong>{report.monthlyEstimate.toFixed(1)} kg CO2e</strong>
            </div>
            <p>{report.message}</p>
          </div>

          <div className="charts">
            <div className="panel chart-card">
              <h2>Breakdown</h2>
              <Doughnut data={chartData} />
            </div>

            <div className="panel chart-card">
              <h2>Comparison</h2>
              <Bar
                data={barData}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
