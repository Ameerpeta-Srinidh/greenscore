require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const factors = {
  transport: 0.21,
  electricity: 0.82,
  food: 2.5,
};

app.use(
  cors({
    origin: frontendUrl,
  })
);
app.use(express.json());

function calculateFootprint(values) {
  const transport = Number(values.transport) || 0;
  const electricity = Number(values.electricity) || 0;
  const food = Number(values.food) || 0;

  const breakdown = {
    transport: transport * factors.transport,
    electricity: electricity * factors.electricity,
    food: food * factors.food,
  };

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const monthlyEstimate = total * 30;
  const score = Math.max(0, 100 - Math.round(total * 4));

  let message = "Good baseline. Small daily changes can still reduce the total.";

  if (breakdown.transport > breakdown.food && breakdown.transport > breakdown.electricity) {
    message = "Transport is your biggest driver. Shorter trips or ride sharing will help most.";
  } else if (breakdown.electricity > breakdown.food) {
    message = "Electricity is the main contributor. Switching off unused devices will lower the score.";
  } else if (breakdown.food > 0) {
    message = "Food is the top contributor. A few lower-carbon meals each week can make a difference.";
  }

  return {
    inputs: { transport, electricity, food },
    breakdown,
    total,
    monthlyEstimate,
    score,
    message,
  };
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/calculate", (request, response) => {
  response.json(calculateFootprint(request.body || {}));
});

app.listen(port, () => {
  console.log(`GreenScore Pro backend running on http://localhost:${port}`);
});
