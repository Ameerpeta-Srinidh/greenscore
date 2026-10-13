const express = require("express");
const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { compareToBenchmark } = require("../data/benchmarks");

const router = express.Router();

// ─── Main Dashboard Analytics ───
router.get("/:userId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    // ── Time range handling ──
    const range = req.query.range || "30d";
    const viewScope = req.query.scope || "personal"; // "personal" or "org"
    let startDate = null;

    if (range === "7d") startDate = new Date(Date.now() - 7 * 86400000);
    else if (range === "30d") startDate = new Date(Date.now() - 30 * 86400000);
    else if (range === "90d") startDate = new Date(Date.now() - 90 * 86400000);

    // ── Build query ──
    const user = await User.findById(userId);
    let query;

    if (viewScope === "org" && user?.organizationId) {
      query = startDate
        ? { organizationId: user.organizationId, createdAt: { $gte: startDate } }
        : { organizationId: user.organizationId };
    } else {
      query = startDate
        ? { userId, createdAt: { $gte: startDate } }
        : { userId };
    }

    // ── Fetch activities ──
    const activities = await Activity.find(query);

    // ── Analytics containers ──
    let totalCarbon = 0;
    const breakdown = {};
    const daily = {};
    const scopeBreakdown = { 1: 0, 2: 0, 3: 0 };

    activities.forEach(a => {
      const type = a.type || "other";
      const carbon = a.carbonKg || 0;

      totalCarbon += carbon;
      breakdown[type] = (breakdown[type] || 0) + carbon;

      // Scope breakdown
      const scope = a.scope || 3;
      scopeBreakdown[scope] = (scopeBreakdown[scope] || 0) + carbon;

      const day = a.createdAt.toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + carbon;
    });

    // ── AI suggestions ──
    let suggestions = [];
    if (activities.length > 2) {
      const { getPersonalizedAdvice } = require("../services/ai.service");
      const aiTips = await getPersonalizedAdvice({ breakdown, totalCarbon });
      if (aiTips && aiTips.length > 0) suggestions = aiTips;
    }

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

    // ── GreenScore ──
    const daysCount = Math.max(1, Object.keys(daily).length);
    const avgDailyCarbon = totalCarbon / daysCount;
    const greenScore = Math.max(0, Math.min(100, 100 - (avgDailyCarbon / 8) * 100));

    // Persist score
    await User.findByIdAndUpdate(userId, { greenScore }, { new: true });

    // ── Benchmark (if org exists) ──
    let benchmark = null;
    if (user?.organizationId) {
      try {
        const org = await Organization.findById(user.organizationId);
        if (org) {
          benchmark = compareToBenchmark(totalCarbon, org.employeeCount, org.industry);
        }
      } catch (e) { /* ignore */ }
    }

    // ── Response ──
    res.json({
      totalCarbon,
      count: activities.length,
      breakdown,
      daily,
      scopeBreakdown,
      suggestions,
      greenScore,
      benchmark,
      challenges: user?.challenges || [],
      viewScope,
    });
  } catch (err) {
    console.error("Dashboard analytics failed:", err);
    res.status(500).json({ error: "Dashboard analytics failed" });
  }
});

// ─── Report Data Endpoint ───
router.get("/:userId/report", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const period = req.query.period || "monthly"; // monthly | quarterly
    const month = req.query.month; // "2024-01" format

    // ── Calculate date range ──
    let startDate, endDate, periodLabel;

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      if (period === "quarterly") {
        const quarterStart = Math.floor((mon - 1) / 3) * 3;
        startDate = new Date(year, quarterStart, 1);
        endDate = new Date(year, quarterStart + 3, 0, 23, 59, 59);
        const quarterNum = Math.ceil(mon / 3);
        periodLabel = `Q${quarterNum} ${year}`;
      } else {
        startDate = new Date(year, mon - 1, 1);
        endDate = new Date(year, mon, 0, 23, 59, 59);
        periodLabel = `${startDate.toLocaleString("default", { month: "long" })} ${year}`;
      }
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      periodLabel = `${startDate.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
    }

    // ── Figure out scope (personal vs org) ──
    const user = await User.findById(userId);
    const viewScope = req.query.scope || (user?.organizationId ? "org" : "personal");

    let query;
    if (viewScope === "org" && user?.organizationId) {
      query = { organizationId: user.organizationId, createdAt: { $gte: startDate, $lte: endDate } };
    } else {
      query = { userId, createdAt: { $gte: startDate, $lte: endDate } };
    }

    const activities = await Activity.find(query).sort({ createdAt: 1 });

    // ── Previous period for comparison ──
    const periodMs = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - periodMs - 86400000);
    const prevEnd = new Date(startDate.getTime() - 1);
    let prevQuery;
    if (viewScope === "org" && user?.organizationId) {
      prevQuery = { organizationId: user.organizationId, createdAt: { $gte: prevStart, $lte: prevEnd } };
    } else {
      prevQuery = { userId, createdAt: { $gte: prevStart, $lte: prevEnd } };
    }
    const prevActivities = await Activity.find(prevQuery);
    const prevTotal = prevActivities.reduce((s, a) => s + (a.carbonKg || 0), 0);

    // ── Compute analytics ──
    let totalCarbon = 0;
    const breakdown = {};
    const daily = {};
    const scopeBreakdown = { 1: 0, 2: 0, 3: 0 };
    const activityList = [];

    activities.forEach(a => {
      const type = a.type || "other";
      const carbon = a.carbonKg || 0;
      totalCarbon += carbon;
      breakdown[type] = (breakdown[type] || 0) + carbon;
      const scope = a.scope || 3;
      scopeBreakdown[scope] += carbon;
      const day = a.createdAt.toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + carbon;
      activityList.push({
        date: a.createdAt,
        type,
        description: a.rawText,
        carbonKg: carbon,
        scope,
      });
    });

    // ── Benchmark ──
    let benchmark = null;
    let orgInfo = null;
    if (user?.organizationId) {
      try {
        const org = await Organization.findById(user.organizationId);
        if (org) {
          benchmark = compareToBenchmark(totalCarbon, org.employeeCount, org.industry);
          orgInfo = { name: org.name, industry: org.industry, employeeCount: org.employeeCount };
        }
      } catch (e) { /* ignore */ }
    }

    // ── Period comparison ──
    const periodChange = prevTotal > 0
      ? Math.round(((totalCarbon - prevTotal) / prevTotal) * 100)
      : null;

    // ── BRSR Section Mapping ──
    const brsrMapping = [
      { section: "Principle 6", indicator: "Essential P6.1", description: "Total energy consumption", value: `${(scopeBreakdown[2] || 0).toFixed(1)} kg CO₂e` },
      { section: "Principle 6", indicator: "Essential P6.2", description: "Scope 1 emissions", value: `${(scopeBreakdown[1] || 0).toFixed(1)} kg CO₂e` },
      { section: "Principle 6", indicator: "Essential P6.3", description: "Scope 2 emissions", value: `${(scopeBreakdown[2] || 0).toFixed(1)} kg CO₂e` },
      { section: "Principle 6", indicator: "Leadership P6.4", description: "Scope 3 emissions", value: `${(scopeBreakdown[3] || 0).toFixed(1)} kg CO₂e` },
      { section: "Principle 6", indicator: "Leadership P6.5", description: "Total GHG emissions", value: `${totalCarbon.toFixed(1)} kg CO₂e` },
    ];

    res.json({
      period: periodLabel,
      startDate,
      endDate,
      totalCarbon,
      count: activities.length,
      breakdown,
      daily,
      scopeBreakdown,
      benchmark,
      orgInfo,
      periodChange,
      previousPeriodTotal: prevTotal,
      brsrMapping,
      activities: activityList,
      viewScope,
      userName: user?.name || user?.email || "",
    });
  } catch (err) {
    console.error("Report generation failed:", err);
    res.status(500).json({ error: "Report generation failed" });
  }
});

// ─── Emission Factors Reference ───
router.get("/reference/emission-factors", (req, res) => {
  const { getAvailableStates, getAvailableTransportModes, getAvailableFoodTypes } = require("../data/emissionFactors");
  const { getAvailableIndustries } = require("../data/benchmarks");

  res.json({
    states: getAvailableStates(),
    transportModes: getAvailableTransportModes(),
    foodTypes: getAvailableFoodTypes(),
    industries: getAvailableIndustries(),
  });
});

module.exports = router;
