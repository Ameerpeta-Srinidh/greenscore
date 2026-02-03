const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({});

    for (const u of users) {
        // Random score between 40 and 99
        const score = Math.floor(Math.random() * (99 - 40 + 1)) + 40;
        u.greenScore = score;
        // Random tier
        u.tier = score > 80 ? "premium" : "free";
        await u.save();
        console.log(`Updated ${u.email} -> ${score} (${u.tier})`);
    }

    process.exit();
}

seed();
