import express from "express";
import { signup, login } from "../controllers/authControllers.js";

const router = express.Router();

// =========================
// AUTH ROUTES
// =========================

// Register new user
router.post("/signup", signup);

// Login user
router.post("/login", login);

export default router;