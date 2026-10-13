/**
 * Tier Gate Middleware
 * Enforces feature access based on user subscription tier.
 * 
 * Usage: router.get("/premium-route", authenticate, tierGate("business"), handler)
 */

const User = require("../models/User");

const TIER_LEVELS = { free: 0, starter: 1, business: 2, enterprise: 3 };

const TIER_NAMES = {
  free: "Free",
  starter: "Starter (₹799/mo)",
  business: "Business (₹2,999/mo)",
  enterprise: "Enterprise (₹9,999/mo)",
};

/**
 * Check if user's tier is at or above the required tier.
 * @param {string} requiredTier - Minimum tier needed: "starter", "business", "enterprise"
 */
function tierGate(requiredTier) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId, "tier trialEndsAt");
      if (!user) return res.status(401).json({ error: "User not found" });

      const userTier = user.tier || "free";
      const userLevel = TIER_LEVELS[userTier] || 0;
      const requiredLevel = TIER_LEVELS[requiredTier] || 0;

      // Check if user is on free trial (trial period acts as "business" tier)
      if (userTier === "free" && user.trialEndsAt) {
        const now = new Date();
        if (now < user.trialEndsAt) {
          // Trial is active — grant access to all features
          req.userTier = "trial";
          req.trialActive = true;
          req.trialDaysLeft = Math.ceil((user.trialEndsAt - now) / 86400000);
          return next();
        }
        // Trial expired
      }

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: `This feature requires the ${TIER_NAMES[requiredTier]} plan or above.`,
          requiredTier,
          currentTier: userTier,
          upgradeUrl: "/pricing",
        });
      }

      req.userTier = userTier;
      next();
    } catch (err) {
      console.error("Tier gate error:", err);
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}

/**
 * Check monthly activity limit for free tier.
 * Free = 50 activities/month. Paid = unlimited.
 */
async function activityLimitCheck(req, res, next) {
  try {
    const User = require("../models/User");
    const Activity = require("../models/Activity");
    
    const user = await User.findById(req.body.userId || req.userId, "tier trialEndsAt");
    if (!user) return next(); // Let other middleware handle auth

    const tier = user.tier || "free";
    
    // Trial users and paid users get unlimited
    if (tier !== "free") return next();
    if (user.trialEndsAt && new Date() < user.trialEndsAt) return next();

    // Count this month's activities
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await Activity.countDocuments({
      userId: user._id,
      createdAt: { $gte: startOfMonth },
    });

    const FREE_LIMIT = 50;
    if (count >= FREE_LIMIT) {
      return res.status(403).json({
        error: `Free plan allows ${FREE_LIMIT} activities per month. You've used ${count}. Upgrade to continue logging.`,
        currentCount: count,
        limit: FREE_LIMIT,
        upgradeUrl: "/pricing",
      });
    }

    req.activityCount = count;
    req.activityLimit = FREE_LIMIT;
    next();
  } catch (err) {
    next(); // Don't block on errors
  }
}

module.exports = { tierGate, activityLimitCheck, TIER_LEVELS, TIER_NAMES };
