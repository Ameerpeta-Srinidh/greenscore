const mongoose = require("mongoose");
const Goal = require("./models/Goal");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const goals = await Goal.find({});
    console.log(`Found ${goals.length} goals.`);

    goals.forEach(g => {
        console.log(`- User[${g.userId}] Month[${g.month}] Target: ${g.targetKg}`);
    });

    process.exit();
}

check();
