require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const entryRoutes = require("./routes/entries");

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/greenscore_premium";
const jwtSecret = process.env.JWT_SECRET;
const frontendOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!jwtSecret) {
  console.error("JWT_SECRET is required. Add it to backend/.env before starting the server.");
  process.exit(1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", entryRoutes);

app.use((error, _request, response, _next) => {
  console.error(error);

  if (error.message === "Origin not allowed by CORS.") {
    return response.status(403).json({ message: error.message });
  }

  response.status(500).json({ message: "Something went wrong." });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`GreenScore Premium backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
