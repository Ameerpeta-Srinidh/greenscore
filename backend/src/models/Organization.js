const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, default: "Other" },
  employeeCount: { type: Number, default: 1 },
  state: { type: String, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    email: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  invites: [{
    email: { type: String },
    token: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  tier: { type: String, enum: ["free", "starter", "business", "enterprise"], default: "free" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Organization", OrganizationSchema);
