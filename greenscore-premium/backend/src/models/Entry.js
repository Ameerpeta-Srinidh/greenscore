const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transport: {
      type: Number,
      required: true,
      min: 0,
    },
    electricity: {
      type: Number,
      required: true,
      min: 0,
    },
    food: {
      type: Number,
      required: true,
      min: 0,
    },
    breakdown: {
      transport: {
        type: Number,
        required: true,
      },
      electricity: {
        type: Number,
        required: true,
      },
      food: {
        type: Number,
        required: true,
      },
    },
    total: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Entry", entrySchema);
