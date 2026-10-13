const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

const Joi = require("joi");
const validate = require("../middleware/validate");

const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().allow("").optional(),
    companyName: Joi.string().allow("").optional(),
  })
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    // Auto-start 14-day free trial on signup
    const trialDays = 14;
    const trialEnd = new Date(Date.now() + trialDays * 86400000);

    const user = await User.create({
      email,
      passwordHash: hash,
      name: name || "",
      companyName: companyName || "",
      trialStartedAt: new Date(),
      trialEndsAt: trialEnd,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Audit
    try {
      await AuditLog.create({
        userId: user._id, action: "create", entityType: "user",
        description: `New user registered: ${email} (14-day trial started)`,
        after: { email, name, companyName, trialEndsAt: trialEnd },
      });
    } catch (e) {}

    res.json({
      token,
      userId: user._id,
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      organizationId: null,
      orgRole: null,
      tier: "free",
      trialEndsAt: trialEnd,
      trialDaysLeft: trialDays,
      trialActive: true,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Calculate trial status
    let trialActive = false, trialDaysLeft = 0;
    if (user.tier === "free" && user.trialEndsAt) {
      const now = new Date();
      if (now < user.trialEndsAt) {
        trialActive = true;
        trialDaysLeft = Math.ceil((user.trialEndsAt - now) / 86400000);
      }
    }

    res.json({
      token,
      userId: user._id,
      email: user.email,
      name: user.name || "",
      companyName: user.companyName || "",
      organizationId: user.organizationId,
      orgRole: user.orgRole,
      tier: user.tier,
      state: user.state,
      trialActive,
      trialDaysLeft,
      trialEndsAt: user.trialEndsAt,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
