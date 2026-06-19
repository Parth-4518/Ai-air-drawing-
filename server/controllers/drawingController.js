import Drawing from "../models/Drawing.js";

// 🖼️ SAVE DRAWING (PHASE 10)
export const saveDrawing = async (req, res) => {
  try {
    const { userId, image, name, color, brushSize, detectedShape } = req.body;

    if (!userId || !image) {
      return res.status(400).json({
        message: "userId and image are required",
      });
    }

    const newDrawing = await Drawing.create({
      userId,
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