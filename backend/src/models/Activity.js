const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  type: String,
  rawText: String,
  parsedData: Object,
  carbonKg: Number,
  scope: { type: Number, enum: [1, 2, 3], default: 3 },
  state: { type: String, default: null },
  source: { type: String, enum: ["manual", "csv", "ai-text"], default: "ai-text" },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient org-wide queries
ActivitySchema.index({ organizationId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", ActivitySchema);
