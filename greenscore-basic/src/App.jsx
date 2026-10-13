import { useState } from "react";

const emissionFactors = {
  transport: 0.21,
  electricity: 0.82,
  food: 2.5,
};

const formatKg = (value) => `${value.toFixed(1)} kg CO2e`;

export default function App() {
  const [inputs, setInputs] = useState({
    transport: 15,
    electricity: 6,
    food: 2,
  });

  const breakdown = {
    transport: inputs.transport * emissionFactors.transport,
    electricity: inputs.electricity * emissionFactors.electricity,
    food: inputs.food * emissionFactors.food,
  };

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setInputs((current) => ({
      ...current,
      [name]: Number(value) || 0,
    }));
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">GreenScore Basic</p>
        <h1>Check a simple daily carbon footprint in seconds.</h1>
        <p className="intro">
          Enter your rough daily activity numbers and get an instant estimate with no
          login, backend, or setup beyond running the app.
        </p>
      </section>

      <section className="card layout">
        <form className="form">
          <label>
            Transport (km per day)
            <input
              min="0"
              name="transport"
              type="number"
              value={inputs.transport}
              onChange={handleChange}
            />
          </label>

          <label>
            Electricity (kWh per day)
            <input
              min="0"
              name="electricity"
              type="number"
              value={inputs.electricity}
              onChange={handleChange}
            />
          </label>

          <label>
            Food (meals with animal products)
            <input
              min="0"
              name="food"
              type="number"
              value={inputs.food}
              onChange={handleChange}
            />
          </label>
        </form>

        <div className="results">
          <div className="result-card highlight">
            <span>Total footprint</span>
            <strong>{formatKg(total)}</strong>
            <small>Estimated for one day</small>
          </div>

          <div className="result-card">
            <span>Transport</span>
            <strong>{formatKg(breakdown.transport)}</strong>
          </div>

          <div className="result-card">
            <span>Electricity</span>
            <strong>{formatKg(breakdown.electricity)}</strong>
          </div>

          <div className="result-card">
            <span>Food</span>
            <strong>{formatKg(breakdown.food)}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
