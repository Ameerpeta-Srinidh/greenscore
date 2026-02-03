const express = require("express");
const User = require("../models/User");
const authenticate = require("../middleware/auth");

const router = express.Router();

// GET /user/leaderboard - Top users by GreenScore
router.get("/leaderboard", async (req, res) => {
    try {
        const users = await User.find({}, "email greenScore tier")
            .sort({ greenScore: -1 })
            .limit(10);

        // Mask emails for privacy (e.g., srin***@gmail.com)
        const leaderboard = users.map(u => {
            const [name, domain] = u.email.split('@');
            const maskedName = name.length > 2 ? name.slice(0, 3) + "***" : name + "***";
            return {
                id: u._id,
                name: `${maskedName}@${domain}`,
                greenScore: u.greenScore || 0,
                tier: u.tier
            };
        });

        res.json(leaderboard);
    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

// System Challenges (Static List)
const SYSTEM_CHALLENGES = [
    { id: "c1", title: "Meatless Monday", description: "Eat only vegetarian food for 1 day.", target: 3, reward: 50, icon: "Salad" },
    { id: "c2", title: "Bike Commuter", description: "Log 3 bike trips this week.", target: 3, reward: 100, icon: "Bike" },
    { id: "c3", title: "Energy Saver", description: "Reduce electricity usage by 5kWh.", target: 5, reward: 80, icon: "Zap" },
    { id: "c4", title: "Zero Waste", description: "Avoid packaged food for 5 meals.", target: 5, reward: 60, icon: "Trash2" },
];

router.get("/challenges", (req, res) => {
    res.json(SYSTEM_CHALLENGES);
});

router.post("/challenges/join", authenticate, async (req, res) => {
    try {
        const { challengeId } = req.body;
        const user = await User.findById(req.userId);

        // Check if already joined
        if (user.challenges.some(c => c.id === challengeId && c.status === "active")) {
            return res.status(400).json({ error: "Already active in this challenge" });
        }

        const challenge = SYSTEM_CHALLENGES.find(c => c.id === challengeId);
        if (!challenge) return res.status(404).json({ error: "Challenge not found" });

        user.challenges.push({
            id: challenge.id,
            title: challenge.title,
            target: challenge.target,
            progress: 0,
            status: "active"
        });

        await user.save();
        res.json(user.challenges);
    } catch (err) {
        res.status(500).json({ error: "Failed to join challenge" });
    }
});

router.post("/challenges/progress", authenticate, async (req, res) => {
    try {
        const { challengeId, increment = 1 } = req.body;
        const user = await User.findById(req.userId);

        const challenge = user.challenges.find(c => c.id === challengeId && c.status === "active");
        if (!challenge) return res.status(404).json({ error: "Active challenge not found" });

        challenge.progress += increment;

        // Check Completion
        let message = "Progress updated";
        if (challenge.progress >= challenge.target) {
            challenge.status = "completed";
            // Reward
            const sysChallenge = SYSTEM_CHALLENGES.find(c => c.id === challengeId);
            user.greenScore += (sysChallenge ? sysChallenge.reward : 10);
            message = "Challenge Completed! 🎉";
        }

        await user.save();
        res.json({ message, challenges: user.challenges, newScore: user.greenScore });
    } catch (err) {
        res.status(500).json({ error: "Failed to update progress" });
    }
});

module.exports = router;
