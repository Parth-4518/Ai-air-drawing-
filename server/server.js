import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import drawingRoutes from "./routes/drawingRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ ADD THIS

dotenv.config();

const app = express();

// ----------------------
// Connect MongoDB
// ----------------------
connectDB();

// ----------------------
// Middleware
// ----------------------
app.use(cors());
app.use(express.json());

// ----------------------
// Routes
// ----------------------
app.use("/api/drawings", drawingRoutes);
app.use("/api/auth", authRoutes); // ✅ ADD THIS

// ----------------------
// Home Route
// ----------------------
app.get("/", (req, res) => {
  res.send("🎨 AI Air Drawing Backend is Running...");
});

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});