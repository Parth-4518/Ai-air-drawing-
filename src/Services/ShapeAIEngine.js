// =========================
// 🧠 Shape AI Engine (FIXED + STABLE)
// =========================

// -------------------------
// Helpers
// -------------------------
export function getDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getPathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += getDistance(points[i - 1], points[i]);
  }
  return len;
}

export function getBoundingBox(points) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  points.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  return {
    minX, minY, maxX, maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// -------------------------
// Features
// -------------------------
export function extractFeatures(points) {
  const start = points[0];
  const end = points[points.length - 1];

  const direct = getDistance(start, end);
  const path = getPathLength(points);

  const straightness = direct / (path || 1);

  const box = getBoundingBox(points);

  const aspectRatio = box.width / (box.height || 1);

  const compactness = path / ((box.width + box.height) || 1);

  return { straightness, aspectRatio, compactness };
}

// -------------------------
// Shape Detection (STABLE RULES)
// -------------------------
export function classifyShape(f) {
  const { straightness, aspectRatio, compactness } = f;

  // LINE
  if (straightness > 0.92) return "line";

  // CIRCLE (more forgiving)
  if (compactness > 1.6 && aspectRatio > 0.6 && aspectRatio < 1.4) {
    return "circle";
  }

  // SQUARE / RECTANGLE
  if (aspectRatio > 0.75 && aspectRatio < 1.25 && straightness < 0.9) {
    return "square";
  }

  return "triangle";
}

// -------------------------
// Correctors
// -------------------------
function correctLine(points) {
  return [points[0], points[points.length - 1]];
}

function correctCircle(points) {
  let cx = 0, cy = 0;

  points.forEach(p => {
    cx += p.x;
    cy += p.y;
  });

  cx /= points.length;
  cy /= points.length;

  let r = 0;
  points.forEach(p => {
    r += getDistance(p, { x: cx, y: cy });
  });

  r /= points.length;

  const smooth = [];

  for (let i = 0; i < 120; i++) {
    const angle = (i / 120) * Math.PI * 2;
    smooth.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }

  return smooth;
}

function correctSquare(points) {
  const box = getBoundingBox(points);

  return [
    { x: box.minX, y: box.minY },
    { x: box.maxX, y: box.minY },
    { x: box.maxX, y: box.maxY },
    { x: box.minX, y: box.maxY },
    { x: box.minX, y: box.minY }
  ];
}

function correctTriangle(points) {
  const box = getBoundingBox(points);

  return [
    { x: box.minX, y: box.maxY },
    { x: box.maxX, y: box.maxY },
    { x: box.minX + box.width / 2, y: box.minY },
    { x: box.minX, y: box.maxY }
  ];
}

// -------------------------
// MAIN
// -------------------------
export function processShape(points) {
  if (!points || points.length < 10) return points;

  const features = extractFeatures(points);
  const shape = classifyShape(features);

  if (shape === "line") return correctLine(points);
  if (shape === "circle") return correctCircle(points);
  if (shape === "square") return correctSquare(points);

  return correctTriangle(points);
} 