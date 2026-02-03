const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
  rawText: String,
  parsedData: Object,
  carbonKg: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Activity", ActivitySchema);
