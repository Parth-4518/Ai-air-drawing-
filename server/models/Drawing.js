import mongoose from "mongoose";

const drawingSchema = new mongoose.Schema(
  {
    // 👤 link to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🖼️ stored image (base64 or Cloudinary URL)
    image: {
      type: String,
      required: true,
    },

    // 🏷️ optional name
    name: {
      type: String,
      default: "Untitled Drawing",
    },

    // 🎨 optional metadata (still useful)
    color: {
      type: String,
      default: "black",
    },

    brushSize: {
      type: Number,
      default: 5,
    },

    detectedShape: {
      type: String,
      default: "UNKNOWN",
    },
  },
  {
    timestamps: true,
  }
);

const Drawing = mongoose.model("Drawing", drawingSchema);

export default Drawing;