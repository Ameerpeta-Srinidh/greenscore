const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  month: String, // Format: YYYY-MM
  targetKg: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Goal", GoalSchema);