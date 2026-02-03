const axios = require("axios");

const AI_BASE_URL = "http://127.0.0.1:8000";

async function parseActivity(text) {
  try {
    const res = await axios.post(`${AI_BASE_URL}/parse-text`, { text });
    return res.data;
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return null;
  }
}

async function getPersonalizedAdvice(stats) {
  try {
    console.log("Calling AI for advice with stats:", stats);
    const res = await axios.post(`${AI_BASE_URL}/analyze`, { stats }, { timeout: 10000 });
    return res.data.tips || [];
  } catch (err) {
    console.error("AI Analyze Error:", err.message);
    // Return empty so frontend uses fallback
    return [];
  }
}

module.exports = { parseActivity, getPersonalizedAdvice };
