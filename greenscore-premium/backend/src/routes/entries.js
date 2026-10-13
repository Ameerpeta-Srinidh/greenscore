const express = require("express");

const auth = require("../middleware/auth");
const Entry = require("../models/Entry");
const { buildDashboard, buildMetrics } = require("../services/calculateScore");

const router = express.Router();

router.use(auth);

router.get("/entries", async (request, response) => {
  const entries = await Entry.find({ user: request.userId }).sort({ createdAt: -1 }).limit(12).lean();

  response.json({ entries });
});

router.post("/entries", async (request, response) => {
  const metrics = buildMetrics(request.body || {});

  const entry = await Entry.create({
    user: request.userId,
    transport: metrics.inputs.transport,
    electricity: metrics.inputs.electricity,
    food: metrics.inputs.food,
    breakdown: metrics.breakdown,
    total: metrics.total,
    score: metrics.score,
  });

  response.status(201).json({
    entry,
    recommendation: metrics.recommendation,
  });
});

router.get("/dashboard", async (request, response) => {
  const entries = await Entry.find({ user: request.userId }).sort({ createdAt: -1 }).limit(30).lean();
  response.json(buildDashboard(entries));
});

module.exports = router;
