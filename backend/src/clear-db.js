const mongoose = require("mongoose");
const Activity = require("./models/Activity");
require("dotenv").config();

async function clear() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const res = await Activity.deleteMany({});
    console.log(`Deleted ${res.deletedCount} activities.`);

    process.exit();
}

clear();
