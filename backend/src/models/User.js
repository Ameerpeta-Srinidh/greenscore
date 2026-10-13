const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  name: { type: String, default: "" },
  companyName: { type: String, default: "" },
  greenScore: { type: Number, default: 0 },
  tier: { type: String, enum: ["free", "starter", "business", "enterprise"], default: "free" },
  trialEndsAt: { type: Date, default: null },
  trialStartedAt: { type: Date, default: null },
  razorpayCustomerId: { type: String, default: null },
  razorpaySubscriptionId: { type: String, default: null },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
  orgRole: { type: String, enum: ["admin", "member"], default: null },
  state: { type: String, default: null },
  challenges: [{
    id: String,
    title: String,
    target: Number,
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    joinedAt: { type: Date, default: Date.now }
  }],
  brsrManualData: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
