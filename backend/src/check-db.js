const mongoose = require("mongoose");
const Activity = require("./models/Activity");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const activities = await Activity.find({});
    console.log(`Found ${activities.length} activities.`);

    activities.forEach(a => {
        console.log(`- [${a.userId}] ${a.rawText} -> ${a.carbonKg}kg`);
    });

    process.exit();
}

check();
