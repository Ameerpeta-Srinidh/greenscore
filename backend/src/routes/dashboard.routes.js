const express = require("express");
const mongoose = require("mongoose");
const Activity = require("../models/Activity");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    // -------- Time range handling --------
    const range = req.query.range || "30d";
    let startDate = null;

    if (range === "7d") {
      startDate = new Date(Date.now() - 7 * 86400000);
    } else if (range === "30d") {
      startDate = new Date(Date.now() - 30 * 86400000);
    }

    const query = startDate
      ? { userId, createdAt: { $gte: startDate } }
      : { userId };

    // -------- Fetch activities --------
    const activities = await Activity.find(query);

    // -------- Analytics containers --------
    let totalCarbon = 0;
    const breakdown = {};
    const daily = {};   // ✅ DEFINED HERE ONCE

    // -------- Compute analytics --------
    activities.forEach(a => {
      const type = a.type || "other";
      const carbon = a.carbonKg || 0;

      totalCarbon += carbon;

      breakdown[type] = (breakdown[type] || 0) + carbon;

      const day = a.createdAt.toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + carbon;
    });

    // -------- AI-style suggestions --------
    // -------- AI-style suggestions --------
    let suggestions = [];

    // Only call AI if there's enough data (e.g., > 2 activities) to save API costs/latency
    if (activities.length > 2) {
      const { getPersonalizedAdvice } = require("../services/ai.service");
      const aiTips = await getPersonalizedAdvice({ breakdown, totalCarbon });
      if (aiTips && aiTips.length > 0) {
        suggestions = aiTips;
      }
    }

    // Fallback if AI fails or not enough data
    if (suggestions.length === 0) {
      if ((breakdown.travel || 0) > totalCarbon * 0.4) {
        suggestions.push("Try public transport or carpooling to reduce travel emissions.");
      }
      if ((breakdown.electricity || 0) > totalCarbon * 0.3) {
        suggestions.push("Reducing AC usage by 1 hour per day can significantly cut emissions.");
      }
      if ((breakdown.food || 0) > totalCarbon * 0.2) {
        suggestions.push("Including more plant-based meals can lower food-related emissions.");
      }
      if (suggestions.length === 0) {
        suggestions.push("Keep logging activities to get personalized tips!");
      }
    }

    // -------- Normalized GreenScore --------
    const daysCount = Math.max(1, Object.keys(daily).length);
    const avgDailyCarbon = totalCarbon / daysCount;

    const greenScore = Math.max(
      0,
      Math.min(100, 100 - (avgDailyCarbon / 8) * 100)
    );

    // PERSIST SCORE FOR LEADERBOARD
    const user = await require("../models/User").findByIdAndUpdate(userId, { greenScore }, { new: true });

    // -------- Response --------
    res.json({
      totalCarbon,
      count: activities.length,
      breakdown,
      daily,
      suggestions,
      greenScore,
      challenges: user.challenges // Send challenges to frontend
    });
  } catch (err) {
    console.error("Dashboard analytics failed:", err);
    res.status(500).json({ error: "Dashboard analytics failed" });
  }
});

module.exports = router;
