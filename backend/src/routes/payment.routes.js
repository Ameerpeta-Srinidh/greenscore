const express = require("express");
const crypto = require("crypto");
const authenticate = require("../middleware/auth");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

// Razorpay setup — uses env vars, gracefully degrades if not set
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require("razorpay");
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized");
  } else {
    console.log("⚠️  Razorpay keys not set — payment routes will use demo mode");
  }
} catch (e) {
  console.log("⚠️  Razorpay init failed:", e.message);
}

// Plan definitions
const PLANS = {
  starter: {
    name: "Starter",
    priceMonthly: 799,
    priceYearly: 7990,
    currency: "INR",
    features: ["Unlimited activities", "CSV Import", "Basic PDF Reports", "3 team members"],
  },
  business: {
    name: "Business",
    priceMonthly: 2999,
    priceYearly: 29990,
    currency: "INR",
    features: ["Everything in Starter", "BRSR Compliance Dashboard", "Audit Trail", "Evidence Vault", "10 team members", "Industry Benchmarks", "Compliance Calendar"],
  },
  enterprise: {
    name: "Enterprise",
    priceMonthly: 9999,
    priceYearly: 99990,
    currency: "INR",
    features: ["Everything in Business", "Unlimited team members", "API Access", "Custom reports", "Priority support", "White-label options"],
  },
};

// GET /payment/plans — List available plans
router.get("/plans", (req, res) => {
  res.json({
    plans: PLANS,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "demo_key",
  });
});

// POST /payment/create-order — Create Razorpay order
router.post("/create-order", authenticate, async (req, res) => {
  try {
    const { plan, billing } = req.body; // plan: "starter"|"business"|"enterprise", billing: "monthly"|"yearly"
    
    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const planData = PLANS[plan];
    const amount = billing === "yearly" ? planData.priceYearly : planData.priceMonthly;
    const amountInPaise = amount * 100;

    // If Razorpay is configured, create real order
    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `gs_${plan}_${Date.now()}`,
        notes: {
          plan,
          billing,
          userId: req.userId,
        },
      });

      return res.json({
        orderId: order.id,
        amount: amountInPaise,
        currency: "INR",
        plan,
        billing,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Demo mode — simulate order
    res.json({
      orderId: `demo_order_${Date.now()}`,
      amount: amountInPaise,
      currency: "INR",
      plan,
      billing,
      keyId: "demo_key",
      demoMode: true,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST /payment/verify — Verify payment and upgrade user
router.post("/verify", authenticate, async (req, res) => {
  try {
    const { orderId, paymentId, signature, plan, billing } = req.body;

    // Verify signature (skip in demo mode)
    if (razorpay && process.env.RAZORPAY_KEY_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
      }
    }

    // Upgrade user
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const oldTier = user.tier;
    user.tier = plan;
    user.trialEndsAt = null; // Clear trial
    user.razorpaySubscriptionId = paymentId || `demo_${Date.now()}`;
    await user.save();

    // Update org tier too if admin
    if (user.organizationId && user.orgRole === "admin") {
      const Organization = require("../models/Organization");
      await Organization.findByIdAndUpdate(user.organizationId, { tier: plan });
    }

    // Audit log
    await AuditLog.create({
      userId: user._id,
      organizationId: user.organizationId,
      action: "upgrade",
      entityType: "subscription",
      description: `Upgraded from ${oldTier} to ${plan} (${billing})`,
      before: { tier: oldTier },
      after: { tier: plan, billing, paymentId },
    });

    res.json({
      message: `Successfully upgraded to ${PLANS[plan].name}!`,
      tier: plan,
      features: PLANS[plan].features,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// POST /payment/start-trial — Start 14-day free trial (Business tier access)
router.post("/start-trial", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if already used trial
    if (user.trialStartedAt) {
      return res.status(400).json({ error: "You've already used your free trial." });
    }

    // Check if already paid
    if (user.tier !== "free") {
      return res.status(400).json({ error: "You're already on a paid plan." });
    }

    const trialDays = 14;
    const trialEnd = new Date(Date.now() + trialDays * 86400000);

    user.trialStartedAt = new Date();
    user.trialEndsAt = trialEnd;
    await user.save();

    // Audit
    await AuditLog.create({
      userId: user._id,
      organizationId: user.organizationId,
      action: "upgrade",
      entityType: "trial",
      description: `Started 14-day free trial (Business tier access)`,
      after: { trialEndsAt: trialEnd },
    });

    res.json({
      message: "🎉 Your 14-day free trial has started!",
      trialEndsAt: trialEnd,
      trialDaysLeft: trialDays,
      accessTier: "business",
    });
  } catch (err) {
    console.error("Start trial error:", err);
    res.status(500).json({ error: "Failed to start trial" });
  }
});

// GET /payment/status — Get current subscription status
router.get("/status", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId, "tier trialEndsAt trialStartedAt razorpaySubscriptionId");
    if (!user) return res.status(404).json({ error: "User not found" });

    let trialActive = false;
    let trialDaysLeft = 0;

    if (user.tier === "free" && user.trialEndsAt) {
      const now = new Date();
      if (now < user.trialEndsAt) {
        trialActive = true;
        trialDaysLeft = Math.ceil((user.trialEndsAt - now) / 86400000);
      }
    }

    res.json({
      tier: user.tier,
      trialActive,
      trialDaysLeft,
      trialEndsAt: user.trialEndsAt,
      trialUsed: !!user.trialStartedAt,
      hasSubscription: !!user.razorpaySubscriptionId,
      plans: PLANS,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get payment status" });
  }
});

module.exports = router;
