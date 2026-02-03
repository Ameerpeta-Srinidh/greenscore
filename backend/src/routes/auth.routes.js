const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const Joi = require("joi");
const validate = require("../middleware/validate");

const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
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
    const { email, password } = req.body;
    // Validation handled by middleware

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash: hash
    });
    res.json({ id: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validation handled by middleware

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
