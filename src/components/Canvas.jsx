import { useEffect, useRef } from "react";

function Canvas({ points }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // clear canvas each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length < 2) return;

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";

    // move to first point
    ctx.moveTo(points[0].x, points[0].y);

    // draw lines
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  }, [points]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      style={{ border: "1px solid black" }}
    />
  );
}

export default Canvas;