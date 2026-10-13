const mongoose = require("mongoose");

const EvidenceSchema = new mongoose.Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, default: "application/octet-stream" },
  fileSize: { type: Number, default: 0 },
  description: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
});

EvidenceSchema.index({ activityId: 1 });
EvidenceSchema.index({ userId: 1 });

module.exports = mongoose.model("Evidence", EvidenceSchema);
