const express = require("express");
const mongoose = require("mongoose");
const Goal = require("../models/Goal");

const router = express.Router();

// Set or update monthly goal
router.post("/", async (req, res) => {
  const { userId, month, targetKg } = req.body;

  const goal = await Goal.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), month },
    { targetKg },
    { upsert: true, new: true }
  );

  res.json(goal);
});

// Get goal for a month
router.get("/:userId/:month", async (req, res) => {
  const goal = await Goal.findOne({
    userId: new mongoose.Types.ObjectId(req.params.userId),
    month: req.params.month
  });

  res.json(goal);
});

module.exports = router;
