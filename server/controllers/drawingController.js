import Drawing from "../models/Drawing.js";

// =========================
// SAVE DRAWING (SECURED)
// =========================
export const saveDrawing = async (req, res) => {
  try {
    const { image, name, color, brushSize, detectedShape } = req.body;

    if (!image) {
      return res.status(400).json({
        message: "image is required",
      });
    }

    const newDrawing = await Drawing.create({
      userId: req.user.id, // 🔐 FIXED (from JWT)
      image,
      name: name || "Untitled Drawing",
      color: color || "black",
      brushSize: brushSize || 5,
      detectedShape: detectedShape || "UNKNOWN",
    });

    res.status(201).json({
      success: true,
      data: newDrawing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// GET ALL DRAWINGS (SECURED)
// =========================
export const getDrawings = async (req, res) => {
  try {
    // Only fetch drawings of logged-in user
    const drawings = await Drawing.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: drawings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// DELETE DRAWING (SECURED)
// =========================
export const deleteDrawing = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only delete their own drawings
    const deleted = await Drawing.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Drawing not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Drawing deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};