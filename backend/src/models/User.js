const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  greenScore: { type: Number, default: 0 },
  tier: { type: String, default: "free" },
  challenges: [{
    id: String,
    title: String,
    target: Number,
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    joinedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
