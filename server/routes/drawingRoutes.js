import express from "express";
import {
  saveDrawing,
  getDrawings,
  deleteDrawing,
} from "../controllers/drawingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// DRAWING ROUTES (PROTECTED)
// =========================

/**
 * @route   POST /api/drawings/save-drawing
 * @desc    Save a new drawing (protected)
 */
router.post("/save-drawing", protect, saveDrawing);

/**
 * @route   GET /api/drawings
 * @desc    Get all drawings (protected)
 */
router.get("/", protect, getDrawings);

/**
 * @route   DELETE /api/drawings/:id
 * @desc    Delete a drawing by ID (protected)
 */
router.delete("/:id", protect, deleteDrawing);

export default router;