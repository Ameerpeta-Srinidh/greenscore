const express = require("express");
const router = express.Router();

const { parseActivity } = require("../services/ai.service");
const { calculateCarbon } = require("../services/carbon.service");
const Activity = require("../models/Activity");

// Removing validation and try-catch for debugging
router.post("/ai-text", async (req, res, next) => {
  try {
    const { text, userId } = req.body;
    console.log(`Processing: ${text}, User: ${userId}`);

    const parsed = await parseActivity(text);
    console.log(`Parsed:`, parsed);

    if (!parsed) {
      return res.status(500).json({ error: "Failed to parse activity. Please try a different description." });
    }

    const carbon = calculateCarbon(parsed);
    console.log(`Carbon:`, carbon);

    const activity = await Activity.create({
      userId,
      type: parsed.type,
      rawText: text,
      parsedData: parsed, // Ensure this field exists in schema
      carbonKg: carbon
    });

    res.json(activity);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    next(err);
  }
});

router.get("/user/:userId", async (req, res) => {
  const activities = await Activity.find({ userId: req.params.userId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(activities);
});

module.exports = router;
