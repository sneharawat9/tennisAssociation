// backend/server.js
const cors = require("cors");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
}); // Load .env file
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
//plug route to the server
const registrationRoutes = require("./routes/registration");
app.use("/api", registrationRoutes);

// Test Route
//
const path = require("path");

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Redirect root to dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

//connect to Mongo db
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
