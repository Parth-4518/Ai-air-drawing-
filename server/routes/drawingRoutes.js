import express from "express";
import {
  saveDrawing,
  getDrawings,
  deleteDrawing,
} from "../controllers/drawingController.js";

const router = express.Router();

/**
 * @route   POST /api/drawings/save-drawing
 * @desc    Save a new drawing
 */
router.post("/save-drawing", saveDrawing);

/**
 * @route   GET /api/drawings
 * @desc    Get all drawings
 */
router.get("/", getDrawings);

/**
 * @route   DELETE /api/drawings/:id
 * @desc    Delete a drawing by ID
 */
router.delete("/:id", deleteDrawing);

export default router;