require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// Check required environment variables
if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set. Authentication may not work properly.");
}

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

connectDB();

const errorHandler = require("./middleware/errorHandler");

app.use("/activity", require("./routes/activity.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));
app.use("/goals", require("./routes/goal.routes"));
app.use("/user", require("./routes/user.routes"));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
