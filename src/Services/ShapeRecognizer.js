// =========================
// 🧠 Shape Recognizer (Per-Stroke)
// =========================

import {
  processShape,
  extractFeatures,
  classifyShape,
  getBoundingBox,
  getDistance,
} from "./ShapeAIEngine";

export function recognizeShape(points) {
  if (!points || points.length < 10) {
    return { shape: "unknown", confidence: 0, correctedPoints: points };
  }

  // Get features
  const features = extractFeatures(points);
  const shape = classifyShape(features);

  // Calculate confidence based on how well the shape fits
  let confidence = calculateConfidence(points, shape, features);

  // Get corrected points
  const correctedPoints = processShape(points);

  return {
    shape,
    confidence: Math.round(confidence * 100),
    correctedPoints,
    rawPoints: points,
    features,
  };
}

function calculateConfidence(points, shape, features) {
  const { straightness, aspectRatio, compactness } = features;

  let score = 0.5; // base score

  switch (shape) {
    case "line":
      score = straightness;
      break;
    case "circle": {
      // Check how close to perfect circle
      const box = getBoundingBox(points);
      const center = {
        x: (box.minX + box.maxX) / 2,
        y: (box.minY + box.maxY) / 2,
      };
      const radii = points.map((p) => getDistance(p, center));
      const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
      const variance =
        radii.reduce((sum, r) => sum + Math.abs(r - avgRadius), 0) /
        radii.length;
      const uniformity = 1 - Math.min(variance / avgRadius, 1);
      score = uniformity * 0.7 + (aspectRatio > 0.7 && aspectRatio < 1.3 ? 0.3 : 0);
      break;
    }
    case "square": {
      // Check aspect ratio and corner angles
      const arScore = aspectRatio > 0.8 && aspectRatio < 1.2 ? 1 : 0.5;
      score = arScore * 0.6 + (1 - straightness) * 0.4;
      break;
    }
    case "triangle": {
      // Check for 3 distinct corners
      score = 0.7 + (1 - straightness) * 0.3;
      break;
    }
    default:
      score = 0.3;
  }

  return Math.min(Math.max(score, 0), 1);
}

export default recognizeShape;
