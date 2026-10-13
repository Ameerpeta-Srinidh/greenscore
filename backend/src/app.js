require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set.");
}

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

connectDB();

const errorHandler = require("./middleware/errorHandler");

// Routes
app.use("/activity", require("./routes/activity.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));
app.use("/goals", require("./routes/goal.routes"));
app.use("/user", require("./routes/user.routes"));
app.use("/org", require("./routes/organization.routes"));
app.use("/compliance", require("./routes/compliance.routes"));
app.use("/payment", require("./routes/payment.routes"));

// Serve uploaded evidence files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
