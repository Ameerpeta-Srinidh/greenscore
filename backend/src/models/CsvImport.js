const mongoose = require("mongoose");

const CsvImportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  filename: String,
  totalRows: { type: Number, default: 0 },
  importedRows: { type: Number, default: 0 },
  failedRows: { type: Number, default: 0 },
  errors: [{ row: Number, message: String }],
  totalCarbonKg: { type: Number, default: 0 },
  status: { type: String, enum: ["processing", "completed", "failed"], default: "processing" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CsvImport", CsvImportSchema);
