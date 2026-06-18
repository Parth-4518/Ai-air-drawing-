export function detectShape(points) {
  if (!points || points.length < 80) {
    return "DRAWING...";
  }

  const smoothed = smoothPoints(points);

  // ----------------------------
  // BOUNDING BOX
  // ----------------------------
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let p of smoothed) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const aspectRatio = width / (height + 0.0001);

  // ----------------------------
  // CIRCLE DETECTION (KEEP STRONG)
  // ----------------------------
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  let avgDist = 0;

  for (let p of smoothed) {
    avgDist += Math.hypot(p.x - cx, p.y - cy);
  }

  avgDist /= smoothed.length;

  let variance = 0;

  for (let p of smoothed) {
    const d = Math.hypot(p.x - cx, p.y - cy);
    variance += Math.abs(d - avgDist);
  }

  variance /= smoothed.length;

  if (variance < 22) {
    return "CIRCLE";
  }

  // ----------------------------
  // 🔥 NEW APPROACH (FIXED TRIANGLE LOGIC)
  // ----------------------------
  let directionChanges = 0;

  for (let i = 10; i < smoothed.length - 10; i += 5) {
    const prev = smoothed[i - 5];
    const curr = smoothed[i];
    const next = smoothed[i + 5];

    const angle = getAngle(prev, curr, next);

    // softer detection (IMPORTANT FIX)
    if (angle > 30 && angle < 160) {
      directionChanges++;
    }
  }

  const normalized = directionChanges / (smoothed.length / 25);

  // ----------------------------
  // TRIANGLE (STABLE RANGE FIX)
  // ----------------------------
  if (normalized >= 1.8 && normalized <= 4.8) {
    return "TRIANGLE";
  }

  // ----------------------------
  // RECTANGLE
  // ----------------------------
  if (normalized > 4.8 && normalized <= 7.5) {
    return "RECTANGLE";
  }

  // ----------------------------
  // LINE
  // ----------------------------
  if (aspectRatio > 4 || aspectRatio < 0.25) {
    return "LINE";
  }

  return "UNKNOWN";
}

// ----------------------------
// HELPERS
// ----------------------------
function getAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;

  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);

  const cos = dot / (magAB * magCB + 0.0001);

  return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
}

function smoothPoints(points) {
  const result = [];

  for (let i = 1; i < points.length; i++) {
    result.push({
      x: (points[i].x + points[i - 1].x) / 2,
      y: (points[i].y + points[i - 1].y) / 2,
    });
  }

  return result.filter((_, i) => i % 3 === 0);
}