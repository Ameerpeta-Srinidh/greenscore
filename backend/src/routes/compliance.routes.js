const express = require("express");
const mongoose = require("mongoose");
const authenticate = require("../middleware/auth");
const { tierGate } = require("../middleware/tierGate");
const Activity = require("../models/Activity");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { BRSR_PRINCIPLE_6, calculateBrsrValues, getReadinessScore } = require("../data/brsrTemplate");
const { getComplianceCalendar, getCurrentFY } = require("../data/complianceCalendar");
const { getRegulatoryUpdates, getHighImpactUpdates } = require("../data/regulatoryUpdates");

const router = express.Router();

// ─── BRSR Auto-Fill Report ───
// Business+ tier (but visible in read-only for trial users)
router.get("/brsr/:userId", authenticate, tierGate("business"), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const fy = req.query.fy || getCurrentFY();
    const [startYear] = fy.split("-").map(Number);

    // FY period: April 1 to March 31
    const startDate = new Date(startYear, 3, 1); // April 1
    const endDate = new Date(startYear + 1, 2, 31, 23, 59, 59); // March 31

    const user = await User.findById(userId);
    let query = { userId, createdAt: { $gte: startDate, $lte: endDate } };
    
    // Org-wide if applicable
    if (user?.organizationId) {
      query = { organizationId: user.organizationId, createdAt: { $gte: startDate, $lte: endDate } };
    }

    const activities = await Activity.find(query);
    const autoValues = calculateBrsrValues(activities);
    
    // Merge with manual data
    const manualData = user?.brsrManualData || {};
    const mergedValues = { ...autoValues, ...manualData };
    
    const readiness = getReadinessScore(mergedValues);

    res.json({
      financialYear: fy,
      period: { start: startDate, end: endDate },
      template: BRSR_PRINCIPLE_6,
      values: mergedValues,
      autoValues,
      manualData,
      readiness,
      activityCount: activities.length,
      trialActive: req.trialActive || false,
      trialDaysLeft: req.trialDaysLeft || null,
    });
  } catch (err) {
    console.error("BRSR generation failed:", err);
    res.status(500).json({ error: "Failed to generate BRSR data" });
  }
});

// ─── Save Manual BRSR Data ───
router.post("/brsr/:userId/manual", authenticate, tierGate("business"), async (req, res) => {
  try {
    const { data } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const before = { ...user.brsrManualData };
    user.brsrManualData = { ...(user.brsrManualData || {}), ...data };
    await user.save();

    // Audit log
    await AuditLog.create({
      userId: user._id,
      organizationId: user.organizationId,
      action: "update",
      entityType: "brsr",
      description: `Updated ${Object.keys(data).length} BRSR manual indicators`,
      before,
      after: user.brsrManualData,
    });

    res.json({ message: "BRSR data saved", data: user.brsrManualData });
  } catch (err) {
    console.error("Save BRSR manual data failed:", err);
    res.status(500).json({ error: "Failed to save BRSR data" });
  }
});

// ─── Compliance Readiness Score ───
router.get("/readiness/:userId", authenticate, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const user = await User.findById(userId);
    
    // Get current FY activities
    const fy = getCurrentFY();
    const [startYear] = fy.split("-").map(Number);
    const startDate = new Date(startYear, 3, 1);
    const endDate = new Date(startYear + 1, 2, 31, 23, 59, 59);

    let query = { userId, createdAt: { $gte: startDate, $lte: endDate } };
    if (user?.organizationId) {
      query = { organizationId: user.organizationId, createdAt: { $gte: startDate, $lte: endDate } };
    }

    const activities = await Activity.find(query);
    const autoValues = calculateBrsrValues(activities);
    const manualData = user?.brsrManualData || {};
    const merged = { ...autoValues, ...manualData };
    const readiness = getReadinessScore(merged);

    res.json({
      financialYear: fy,
      readiness,
      totalActivities: activities.length,
      totalEmissions: autoValues.totalKg,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate readiness" });
  }
});

// ─── Compliance Calendar ───
router.get("/calendar", (req, res) => {
  const fy = req.query.fy || getCurrentFY();
  const calendar = getComplianceCalendar(fy);
  res.json({ financialYear: fy, deadlines: calendar });
});

// ─── Regulatory Updates ───
router.get("/updates", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const updates = getRegulatoryUpdates(limit);
  res.json(updates);
});

// ─── High Impact Alerts ───
router.get("/alerts", (req, res) => {
  const alerts = getHighImpactUpdates();
  res.json(alerts);
});

// ─── Audit Trail ───
router.get("/audit/:userId", authenticate, tierGate("business"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let query = { userId: new mongoose.Types.ObjectId(req.params.userId) };
    if (user?.organizationId) {
      query = { organizationId: user.organizationId };
    }

    // Filter by entity type
    if (req.query.entityType) {
      query.entityType = req.query.entityType;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Audit trail error:", err);
    res.status(500).json({ error: "Failed to fetch audit trail" });
  }
});

module.exports = router;
