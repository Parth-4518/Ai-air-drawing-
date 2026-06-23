import { useEffect, useRef } from "react";

function Canvas({ drawables = [], color = "black", brushSize = 3, videoSize, selectedShapeId = null }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas resolution to webcam
    const width = videoSize?.width || 640;
    const height = videoSize?.height || 480;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!drawables || drawables.length === 0) return;

    // Draw each shape
    drawables.forEach((drawable) => {
      const points = drawable.correctedPoints || drawable.points || [];
      const strokeColor = drawable.color || color;
      const size = drawable.brushSize || brushSize;
      const isSelected = drawable.id === selectedShapeId;

      if (!points || points.length < 2) return;

      ctx.beginPath();
      ctx.lineWidth = size;
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Add glow effect for neon colors
      const isNeon = [
        '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
        '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
        '#84CC16', '#6366F1', '#14B8A6', '#D946EF'
      ].includes(strokeColor);

      if (isNeon || size > 5) {
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = size * 2;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      // If selected, draw highlight box
      if (isSelected) {
        const box = getBoundingBox(points);
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeRect(box.minX - 10, box.minY - 10, box.width + 20, box.height + 20);
        ctx.restore();
      }

      const first = points[0];
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      // Check closed shape
      const last = points[points.length - 1];
      const isClosed =
        points.length > 2 &&
        Math.abs(first.x - last.x) < 10 &&
        Math.abs(first.y - last.y) < 10;

      if (isClosed) {
        ctx.closePath();
      }

      ctx.stroke();

      // Shape labels removed - no real-time shape correction
    });
  }, [drawables, color, brushSize, videoSize, selectedShapeId]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "640px",
        height: "480px",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

// Helper to get bounding box for selection highlight
function getBoundingBox(points) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  points.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export default Canvas;
