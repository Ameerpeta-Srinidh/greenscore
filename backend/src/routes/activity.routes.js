const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse/sync");
const router = express.Router();

const { parseActivity } = require("../services/ai.service");
const { calculateCarbon } = require("../services/carbon.service");
const Activity = require("../models/Activity");
const CsvImport = require("../models/CsvImport");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Evidence = require("../models/Evidence");
const { activityLimitCheck } = require("../middleware/tierGate");

// Multer config for CSV upload (5MB max)
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});

// Multer config for evidence uploads (10MB, images + PDF)
const uploadsDir = path.join(__dirname, "../../uploads/evidence");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const evidenceUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF and image files are allowed"), false);
  },
});

// POST /activity/ai-text — Add via AI text parsing
router.post("/ai-text", activityLimitCheck, async (req, res, next) => {
  try {
    const { text, userId } = req.body;
    const parsed = await parseActivity(text);
    if (!parsed) {
      return res.status(500).json({ error: "Failed to parse activity. Please try a different description." });
    }

    let userState = null, orgId = null;
    try {
      const user = await User.findById(userId);
      userState = user?.state || null;
      orgId = user?.organizationId || null;
    } catch (e) {}

    const { carbonKg, scope } = calculateCarbon(parsed, userState);

    const activity = await Activity.create({
      userId, organizationId: orgId, type: parsed.type,
      rawText: text, parsedData: parsed, carbonKg, scope,
      state: userState, source: "ai-text",
    });

    // Audit log
    try {
      await AuditLog.create({
        userId, organizationId: orgId, action: "create",
        entityType: "activity", entityId: activity._id,
        description: `Logged: "${text}" → ${carbonKg} kg CO₂ (Scope ${scope})`,
        after: { type: parsed.type, carbonKg, scope },
      });
    } catch (e) {}

    res.json(activity);
  } catch (err) { next(err); }
});

// POST /activity/csv-import — Bulk import via CSV
router.post("/csv-import", csvUpload.single("csvFile"), async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!req.file) return res.status(400).json({ error: "CSV file is required" });

    const user = await User.findById(userId);
    const userState = user?.state || null;
    const orgId = user?.organizationId || null;

    // Check tier — CSV requires Starter+
    const tier = user?.tier || "free";
    const trialActive = user?.trialEndsAt && new Date() < user.trialEndsAt;
    if (tier === "free" && !trialActive) {
      return res.status(403).json({ error: "CSV Import requires Starter plan or above.", upgradeUrl: "/pricing" });
    }

    const csvContent = req.file.buffer.toString("utf-8");
    let records;
    try {
      records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });
    } catch (parseErr) {
      return res.status(400).json({ error: `CSV parsing error: ${parseErr.message}` });
    }
    if (records.length === 0) return res.status(400).json({ error: "CSV file is empty" });

    const importRecord = await CsvImport.create({
      userId, organizationId: orgId, filename: req.file.originalname,
      totalRows: records.length, status: "processing",
    });

    const activities = [];
    const errors = [];
    let totalCarbonKg = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      try {
        const rowNum = i + 2;
        const normalized = {};
        Object.keys(row).forEach(k => { normalized[k.toLowerCase().trim()] = row[k]; });

        const type = (normalized.type || normalized.category || "").toLowerCase().trim();
        const description = normalized.description || normalized.desc || normalized.activity || "";
        const value = parseFloat(normalized.value || normalized.amount || normalized.quantity || 0);
        const unit = (normalized.unit || normalized.units || "").toLowerCase().trim();
        const date = normalized.date || normalized.created_at || null;
        const state = normalized.state || userState;

        if (!type) { errors.push({ row: rowNum, message: "Missing 'type' column" }); continue; }

        let parsedData = {};
        if (type === "travel" || type === "transport") {
          let mode = "car";
          if (unit.includes("-")) mode = unit.split("-")[1] || "car";
          else if (normalized.mode) mode = normalized.mode;
          parsedData = { type: "travel", mode, distance_km: value || 10 };
        } else if (type === "electricity" || type === "power" || type === "energy") {
          parsedData = { type: "electricity", electricity_kwh: value || 0 };
        } else if (type === "food" || type === "meal") {
          parsedData = { type: "food", food_type: normalized.food_type || normalized.subtype || unit || "veg" };
        } else if (type === "shopping" || type === "purchase") {
          parsedData = { type: "shopping", item_type: normalized.item_type || normalized.subtype || description || "other" };
        } else {
          errors.push({ row: rowNum, message: `Unknown type: "${type}". Use: travel, electricity, food, shopping` });
          continue;
        }

        const { carbonKg, scope } = calculateCarbon(parsedData, state);
        totalCarbonKg += carbonKg;

        activities.push({
          userId, organizationId: orgId, type: parsedData.type,
          rawText: description || `CSV Import: ${type} - ${value} ${unit}`,
          parsedData, carbonKg, scope, state, source: "csv",
          createdAt: date ? new Date(date) : new Date(),
        });
      } catch (rowErr) { errors.push({ row: i + 2, message: rowErr.message }); }
    }

    if (activities.length > 0) await Activity.insertMany(activities);

    importRecord.importedRows = activities.length;
    importRecord.failedRows = errors.length;
    importRecord.errors = errors.slice(0, 50);
    importRecord.totalCarbonKg = totalCarbonKg;
    importRecord.status = "completed";
    await importRecord.save();

    // Audit log
    try {
      await AuditLog.create({
        userId, organizationId: orgId, action: "import",
        entityType: "csv-import", entityId: importRecord._id,
        description: `CSV import: ${activities.length} activities, ${totalCarbonKg.toFixed(1)} kg CO₂`,
        after: { imported: activities.length, failed: errors.length, totalCarbonKg },
      });
    } catch (e) {}

    res.json({
      importId: importRecord._id, totalRows: records.length,
      imported: activities.length, failed: errors.length,
      totalCarbonKg: Math.round(totalCarbonKg * 100) / 100,
      errors: errors.slice(0, 10),
    });
  } catch (err) { console.error("CSV import error:", err); next(err); }
});

// POST /activity/:id/evidence — Upload evidence for an activity
router.post("/:id/evidence", evidenceUpload.single("file"), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });
    if (!req.file) return res.status(400).json({ error: "File is required" });

    const evidence = await Evidence.create({
      activityId: activity._id,
      userId: activity.userId,
      organizationId: activity.organizationId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      description: req.body.description || "",
    });

    // Audit
    try {
      await AuditLog.create({
        userId: activity.userId, organizationId: activity.organizationId,
        action: "create", entityType: "evidence", entityId: evidence._id,
        description: `Uploaded evidence "${req.file.originalname}" for activity ${activity._id}`,
        after: { filename: req.file.originalname, activityId: activity._id },
      });
    } catch (e) {}

    res.json(evidence);
  } catch (err) {
    console.error("Evidence upload error:", err);
    res.status(500).json({ error: "Failed to upload evidence" });
  }
});

// GET /activity/:id/evidence — Get evidence for an activity
router.get("/:id/evidence", async (req, res) => {
  try {
    const evidence = await Evidence.find({ activityId: req.params.id }).sort({ uploadedAt: -1 });
    res.json(evidence);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch evidence" });
  }
});

// Serve uploaded evidence files
router.get("/evidence/file/:filename", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  res.sendFile(filePath);
});

// GET /activity/imports/:userId
router.get("/imports/:userId", async (req, res) => {
  try {
    const imports = await CsvImport.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(10);
    res.json(imports);
  } catch (err) { res.status(500).json({ error: "Failed to fetch imports" }); }
});

// GET /activity/sample-csv
router.get("/sample-csv", (req, res) => {
  const csv = `date,type,description,value,unit,mode
2024-01-15,electricity,Office AC and lights,150,kWh,
2024-01-15,travel,Employee commute to office,25,km,car
2024-01-15,travel,Delivery run,12,km,two-wheeler
2024-01-16,food,Team lunch,1,non-veg,
2024-01-16,food,Office breakfast,1,veg,
2024-01-17,shopping,Office supplies,1,other,
2024-01-18,travel,Client meeting via metro,15,km,metro
2024-01-19,electricity,Server room,50,kWh,`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=greenscore_template.csv");
  res.send(csv);
});

// DELETE /activity/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    // Audit before delete
    try {
      await AuditLog.create({
        userId: activity.userId, organizationId: activity.organizationId,
        action: "delete", entityType: "activity", entityId: activity._id,
        description: `Deleted activity: "${activity.rawText}" (${activity.carbonKg} kg CO₂)`,
        before: { type: activity.type, carbonKg: activity.carbonKg, rawText: activity.rawText },
      });
    } catch (e) {}

    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: "Activity deleted successfully" });
  } catch (err) { next(err); }
});

// GET /activity/user/:userId
router.get("/user/:userId", async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const activities = await Activity.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(limit);
  res.json(activities);
});

module.exports = router;
