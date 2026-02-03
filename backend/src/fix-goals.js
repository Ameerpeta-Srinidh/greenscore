const mongoose = require("mongoose");
const Goal = require("./models/Goal");
require("dotenv").config();

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const res = await Goal.updateMany(
        { targetKg: { $in: [null, 0] } },
        { $set: { targetKg: 5 } }
    );

    console.log(`Updated ${res.modifiedCount} goals.`);
    process.exit();
}

fix();
