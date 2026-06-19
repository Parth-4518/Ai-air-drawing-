import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import drawingRoutes from "./routes/drawingRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Initialize app
const app = express();

// =========================
// Database Connection
// =========================
connectDB();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// API Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/drawings", drawingRoutes);

// =========================
// Health Check Route
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "🎨 AI Air Drawing Backend is Running...",
    status: "OK",
  });
});

// =========================
// Handle Unknown Routes
// =========================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});