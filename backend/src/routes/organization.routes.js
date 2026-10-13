const express = require("express");
const crypto = require("crypto");
const authenticate = require("../middleware/auth");
const Organization = require("../models/Organization");
const User = require("../models/User");
const { getAvailableIndustries } = require("../data/benchmarks");
const { getAvailableStates } = require("../data/emissionFactors");

const router = express.Router();

// GET /org/meta — Available industries and states for dropdowns
router.get("/meta", (req, res) => {
  res.json({
    industries: getAvailableIndustries(),
    states: getAvailableStates(),
  });
});

// POST /org — Create organization
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, industry, employeeCount, state } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.organizationId) {
      return res.status(400).json({ error: "You already belong to an organization. Leave it first." });
    }

    const org = await Organization.create({
      name: name.trim(),
      industry: industry || "Other",
      employeeCount: employeeCount || 1,
      state: state || null,
      owner: req.userId,
      members: [{
        userId: req.userId,
        role: "admin",
        email: user.email,
      }],
    });

    // Update user
    user.organizationId = org._id;
    user.orgRole = "admin";
    if (state) user.state = state;
    await user.save();

    res.json(org);
  } catch (err) {
    console.error("Create org error:", err);
    res.status(500).json({ error: "Failed to create organization" });
  }
});

// GET /org/mine — Get current user's organization
router.get("/mine", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.organizationId) {
      return res.json(null);
    }

    const org = await Organization.findById(user.organizationId);
    if (!org) {
      return res.json(null);
    }

    // Populate member emails/names
    const memberIds = org.members.map(m => m.userId);
    const users = await User.find({ _id: { $in: memberIds } }, "email name greenScore");
    const membersWithInfo = org.members.map(m => {
      const u = users.find(u => u._id.toString() === m.userId.toString());
      return {
        userId: m.userId,
        role: m.role,
        email: u?.email || m.email,
        name: u?.name || "",
        greenScore: u?.greenScore || 0,
        joinedAt: m.joinedAt,
      };
    });

    res.json({
      ...org.toObject(),
      members: membersWithInfo,
    });
  } catch (err) {
    console.error("Get org error:", err);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
});

// POST /org/invite — Invite member by email
router.post("/invite", authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findById(req.userId);
    if (!user || !user.organizationId) {
      return res.status(400).json({ error: "You must be in an organization to invite" });
    }
    if (user.orgRole !== "admin") {
      return res.status(403).json({ error: "Only admins can invite members" });
    }

    const org = await Organization.findById(user.organizationId);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    // Check tier limits
    const maxMembers = { free: 1, starter: 3, business: 10, enterprise: 100 };
    const limit = maxMembers[org.tier] || 1;
    if (org.members.length >= limit) {
      return res.status(403).json({
        error: `Your ${org.tier} plan allows max ${limit} members. Upgrade to add more.`,
      });
    }

    // Check if already a member
    if (org.members.some(m => m.email === email)) {
      return res.status(400).json({ error: "This user is already a member" });
    }

    // Check existing pending invite
    if (org.invites.some(i => i.email === email)) {
      return res.status(400).json({ error: "Invite already pending for this email" });
    }

    const token = crypto.randomBytes(16).toString("hex");
    org.invites.push({ email, token });
    await org.save();

    res.json({ message: `Invite created for ${email}`, token });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

// POST /org/join — Accept invite
router.post("/join", authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Invite token is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.organizationId) {
      return res.status(400).json({ error: "You already belong to an organization" });
    }

    // Find org with this invite
    const org = await Organization.findOne({ "invites.token": token });
    if (!org) return res.status(404).json({ error: "Invalid or expired invite" });

    const invite = org.invites.find(i => i.token === token);
    if (invite.email !== user.email) {
      return res.status(403).json({ error: "This invite was sent to a different email" });
    }

    // Add to members, remove invite
    org.members.push({ userId: req.userId, role: "member", email: user.email });
    org.invites = org.invites.filter(i => i.token !== token);
    await org.save();

    // Update user
    user.organizationId = org._id;
    user.orgRole = "member";
    if (org.state && !user.state) user.state = org.state;
    await user.save();

    res.json({ message: "Successfully joined organization", org });
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ error: "Failed to join organization" });
  }
});

// PUT /org — Update organization details (admin only)
router.put("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.organizationId || user.orgRole !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { name, industry, employeeCount, state } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (industry) updates.industry = industry;
    if (employeeCount) updates.employeeCount = employeeCount;
    if (state !== undefined) updates.state = state;

    const org = await Organization.findByIdAndUpdate(
      user.organizationId,
      { $set: updates },
      { new: true }
    );

    res.json(org);
  } catch (err) {
    console.error("Update org error:", err);
    res.status(500).json({ error: "Failed to update organization" });
  }
});

// DELETE /org/member/:userId — Remove member (admin only)
router.delete("/member/:memberId", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.organizationId || user.orgRole !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (req.params.memberId === req.userId) {
      return res.status(400).json({ error: "Cannot remove yourself. Transfer ownership first." });
    }

    const org = await Organization.findById(user.organizationId);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    org.members = org.members.filter(m => m.userId.toString() !== req.params.memberId);
    await org.save();

    // Clear member's org reference
    await User.findByIdAndUpdate(req.params.memberId, {
      organizationId: null,
      orgRole: null,
    });

    res.json({ message: "Member removed", org });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// POST /org/leave — Leave organization
router.post("/leave", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.organizationId) {
      return res.status(400).json({ error: "You are not in an organization" });
    }

    const org = await Organization.findById(user.organizationId);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    if (org.owner.toString() === req.userId) {
      return res.status(400).json({ error: "Owner cannot leave. Transfer ownership or delete the organization." });
    }

    org.members = org.members.filter(m => m.userId.toString() !== req.userId);
    await org.save();

    user.organizationId = null;
    user.orgRole = null;
    await user.save();

    res.json({ message: "Left organization successfully" });
  } catch (err) {
    console.error("Leave org error:", err);
    res.status(500).json({ error: "Failed to leave organization" });
  }
});

module.exports = router;
