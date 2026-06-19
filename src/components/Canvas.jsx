import { useEffect, useRef } from "react";

function Canvas({ points, color = "black", brushSize = 3 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // 🧼 clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!points || points.length < 2) return;

    ctx.beginPath();

    // 🎨 dynamic styling from props
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // move to first point
    ctx.moveTo(points[0].x, points[0].y);

    // draw smooth lines
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  }, [points, color, brushSize]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      style={{
        border: "1px solid black",
        background: "transparent",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}

export default Canvas;