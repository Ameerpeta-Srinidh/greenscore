const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    users.forEach(u => {
        console.log(`- ${u.email}: Score=${u.greenScore}`);
    });

    process.exit();
}

check();
