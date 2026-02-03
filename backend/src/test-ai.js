const axios = require("axios");

const URL = "http://localhost:5000/activity/ai-text";

async function test() {
    try {
        console.log(`Connecting to ${URL}...`);
        const res = await axios.post(URL, {
            text: "I ran 5km",
            userId: "678a6ff61922c2a0d922a900"
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.log("Response:", err.response.data);
        }
    }
}

test();
