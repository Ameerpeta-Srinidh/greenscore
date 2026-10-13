const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/signup", async (request, response) => {
  const { name, email, password } = request.body || {};

  if (!name || !email || !password || password.length < 6) {
    return response
      .status(400)
      .json({ message: "Name, email, and a password with 6+ characters are required." });
  }

  const existingUser = await User.findOne({ email: String(email).toLowerCase() });

  if (existingUser) {
    return response.status(400).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: String(email).toLowerCase(),
    passwordHash,
  });

  return response.status(201).json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

router.post("/login", async (request, response) => {
  const { email, password } = request.body || {};

  const user = await User.findOne({ email: String(email).toLowerCase() });

  if (!user) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = await bcrypt.compare(password || "", user.passwordHash);

  if (!passwordMatches) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  return response.json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = router;
