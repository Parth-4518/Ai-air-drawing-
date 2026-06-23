import * as tf from "@tensorflow/tfjs";

// =========================
// 🧠 REAL AI SHAPE RECOGNIZER
// =========================

let model = null;
let isTraining = false;

const SHAPE_LABELS = ["CIRCLE", "SQUARE", "TRIANGLE", "LINE", "UNKNOWN"];
const NUM_CLASSES = SHAPE_LABELS.length;

// =========================
// Feature Extraction (28 features)
// =========================
export function extractFeatures(points) {
  if (!points || points.length < 10) {
    return new Array(28).fill(0);
  }

  // Normalize points to 0-1 range
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const scale = Math.max(width, height);

  const normalized = points.map((p) => ({
    x: (p.x - minX) / scale,
    y: (p.y - minY) / scale,
  }));

  // 1. Bounding box aspect ratio
  const aspectRatio = width / height;

  // 2. Total path length
  let pathLength = 0;
  for (let i = 1; i < normalized.length; i++) {
    const dx = normalized[i].x - normalized[i - 1].x;
    const dy = normalized[i].y - normalized[i - 1].y;
    pathLength += Math.sqrt(dx * dx + dy * dy);
  }

  // 3. Straightness (start to end distance / path length)
  const start = normalized[0];
  const end = normalized[normalized.length - 1];
  const directDistance = Math.sqrt(
    (end.x - start.x) ** 2 + (end.y - start.y) ** 2
  );
  const straightness = directDistance / (pathLength || 1);

  // 4. Centroid
  let cx = 0,
    cy = 0;
  for (const p of normalized) {
    cx += p.x;
    cy += p.y;
  }
  cx /= normalized.length;
  cy /= normalized.length;

  // 5. Average distance from centroid
  let avgDist = 0;
  let distVariance = 0;
  const distances = normalized.map((p) =>
    Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
  );
  avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
  distances.forEach((d) => {
    distVariance += (d - avgDist) ** 2;
  });
  distVariance /= distances.length;
  const distStdDev = Math.sqrt(distVariance);

  // 6. Compactness (path length / perimeter of bounding box)
  const perimeter = 2 * (width / scale + height / scale);
  const compactness = pathLength / (perimeter || 1);

  // 7. Number of direction changes (corners)
  let directionChanges = 0;
  for (let i = 2; i < normalized.length; i++) {
    const dx1 = normalized[i - 1].x - normalized[i - 2].x;
    const dy1 = normalized[i - 1].y - normalized[i - 2].y;
    const dx2 = normalized[i].x - normalized[i - 1].x;
    const dy2 = normalized[i].y - normalized[i - 1].y;

    const angle1 = Math.atan2(dy1, dx1);
    const angle2 = Math.atan2(dy2, dx2);
    const angleDiff = Math.abs(angle2 - angle1);

    if (angleDiff > 0.5 && angleDiff < Math.PI - 0.5) {
      directionChanges++;
    }
  }

  // 8. Closedness (distance between start and end)
  const closedness = Math.sqrt(
    (start.x - end.x) ** 2 + (start.y - end.y) ** 2
  );

  // 9. Area (using shoelace formula)
  let area = 0;
  for (let i = 0; i < normalized.length - 1; i++) {
    area +=
      normalized[i].x * normalized[i + 1].y -
      normalized[i + 1].x * normalized[i].y;
  }
  area = Math.abs(area) / 2;

  // 10. Convex hull approximation (count of extreme points)
  let extremePoints = 0;
  for (let i = 1; i < normalized.length - 1; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];
    const next = normalized[i + 1];

    const cross =
      (curr.x - prev.x) * (next.y - curr.y) -
      (curr.y - prev.y) * (next.x - curr.x);
    if (Math.abs(cross) > 0.01) extremePoints++;
  }

  // 11. Symmetry scores
  let xSymmetry = 0;
  let ySymmetry = 0;
  for (const p of normalized) {
    xSymmetry += Math.abs(p.x - cx);
    ySymmetry += Math.abs(p.y - cy);
  }
  xSymmetry /= normalized.length;
  ySymmetry /= normalized.length;

  // 12. Density (points per unit area)
  const density = normalized.length / (area + 0.01);

  // 13. Point distribution (quadrants)
  let q1 = 0,
    q2 = 0,
    q3 = 0,
    q4 = 0;
  for (const p of normalized) {
    if (p.x >= cx && p.y >= cy) q1++;
    else if (p.x < cx && p.y >= cy) q2++;
    else if (p.x < cx && p.y < cy) q3++;
    else q4++;
  }
  const total = normalized.length;
  const q1r = q1 / total;
  const q2r = q2 / total;
  const q3r = q3 / total;
  const q4r = q4 / total;

  // Combine all features
  const features = [
    aspectRatio,
    pathLength,
    straightness,
    avgDist,
    distStdDev,
    compactness,
    directionChanges / 10, // normalize
    closedness,
    area,
    extremePoints / 10, // normalize
    xSymmetry,
    ySymmetry,
    density / 100, // normalize
    q1r,
    q2r,
    q3r,
    q4r,
    // Add some derived features
    aspectRatio * straightness,
    avgDist * compactness,
    closedness * straightness,
    directionChanges * closedness,
    area * density,
    xSymmetry * ySymmetry,
    q1r + q3r, // diagonal symmetry
    q2r + q4r, // other diagonal
    Math.abs(q1r - q3r), // asymmetry
    Math.abs(q2r - q4r), // asymmetry
    pathLength * straightness,
    distStdDev / (avgDist + 0.01), // relative variance
  ];

  return features;
}

// =========================
// Generate Realistic Air Drawing Training Data
// =========================
function addAirDrawingNoise(points, intensity = 1.0) {
  // Simulate hand shake, tracking jitter, and imperfect gestures
  const noisy = [];
  let prevX = points[0].x;
  let prevY = points[0].y;

  for (let i = 0; i < points.length; i++) {
    // Hand tremor (high frequency small movements)
    const tremorX = (Math.random() - 0.5) * 0.015 * intensity;
    const tremorY = (Math.random() - 0.5) * 0.015 * intensity;

    // Tracking drift (slow wandering)
    const driftX = Math.sin(i * 0.1) * 0.02 * intensity;
    const driftY = Math.cos(i * 0.15) * 0.02 * intensity;

    // Sudden jumps (lost tracking momentarily)
    let jumpX = 0,
      jumpY = 0;
    if (Math.random() < 0.05 * intensity) {
      jumpX = (Math.random() - 0.5) * 0.08 * intensity;
      jumpY = (Math.random() - 0.5) * 0.08 * intensity;
    }

    // Overshoot at corners (common in air drawing)
    let overshootX = 0,
      overshootY = 0;
    if (i > 0 && i < points.length - 1) {
      const angle1 = Math.atan2(
        points[i].y - points[i - 1].y,
        points[i].x - points[i - 1].x
      );
      const angle2 = Math.atan2(
        points[i + 1].y - points[i].y,
        points[i + 1].x - points[i].x
      );
      const angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > 0.3) {
        // Corner detected - add overshoot
        overshootX = (Math.random() - 0.5) * 0.05 * intensity;
        overshootY = (Math.random() - 0.5) * 0.05 * intensity;
      }
    }

    const x =
      points[i].x + tremorX + driftX + jumpX + overshootX;
    const y =
      points[i].y + tremorY + driftY + jumpY + overshootY;

    // Smooth with previous point (slight lag in hand movement)
    const smoothX = prevX * 0.1 + x * 0.9;
    const smoothY = prevY * 0.1 + y * 0.9;

    noisy.push({ x: smoothX, y: smoothY });
    prevX = smoothX;
    prevY = smoothY;
  }

  return noisy;
}

function generateTrainingData() {
  const data = [];

  // Generate synthetic shapes with realistic air drawing noise
  const samples = 150; // More samples for better generalization

  // CIRCLES - with varying degrees of imperfection
  for (let i = 0; i < samples; i++) {
    const points = [];
    const cx = 0.5 + (Math.random() - 0.5) * 0.1;
    const cy = 0.5 + (Math.random() - 0.5) * 0.1;
    const r = 0.15 + Math.random() * 0.2;

    // Vary number of points (some users draw faster/slower)
    const numPoints = 60 + Math.floor(Math.random() * 80);

    // Some circles are not fully closed (common in air drawing)
    const completeness = 0.7 + Math.random() * 0.35; // 70% to 105% complete
    const numPointsToDraw = Math.floor(numPoints * completeness);

    for (let j = 0; j < numPointsToDraw; j++) {
      const angle = (j / numPoints) * Math.PI * 2;
      points.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }

    // Add varying noise levels
    const noiseIntensity = 0.5 + Math.random() * 2.0;
    const noisyPoints = addAirDrawingNoise(points, noiseIntensity);
    data.push({ points: noisyPoints, label: 0 }); // CIRCLE = 0
  }

  // SQUARES - with realistic imperfections
  for (let i = 0; i < samples; i++) {
    const points = [];
    const size = 0.2 + Math.random() * 0.25;
    const x = 0.2 + Math.random() * 0.3;
    const y = 0.2 + Math.random() * 0.3;

    // Some squares are rectangles (aspect ratio varies)
    const width = size * (0.7 + Math.random() * 0.6);
    const height = size * (0.7 + Math.random() * 0.6);

    const sides = [
      { x: x, y: y },
      { x: x + width, y: y },
      { x: x + width, y: y + height },
      { x: x, y: y + height },
    ];

    // Some users don't close the shape fully
    const sidesToDraw = Math.random() < 0.2 ? 3 : 4;

    for (let s = 0; s < sidesToDraw; s++) {
      const start = sides[s];
      const end = sides[(s + 1) % 4];
      const pointsPerSide = 15 + Math.floor(Math.random() * 15);
      for (let j = 0; j < pointsPerSide; j++) {
        const t = j / pointsPerSide;
        points.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        });
      }
    }

    const noiseIntensity = 0.5 + Math.random() * 2.0;
    const noisyPoints = addAirDrawingNoise(points, noiseIntensity);
    data.push({ points: noisyPoints, label: 1 }); // SQUARE = 1
  }

  // TRIANGLES - with realistic imperfections
  for (let i = 0; i < samples; i++) {
    const points = [];
    const noiseIntensity = 0.5 + Math.random() * 2.0;

    // Various triangle types
    const triangleType = Math.random();
    let vertices;

    if (triangleType < 0.33) {
      // Equilateral-ish
      vertices = [
        { x: 0.5 + (Math.random() - 0.5) * 0.1, y: 0.2 + Math.random() * 0.1 },
        { x: 0.2 + Math.random() * 0.1, y: 0.75 + (Math.random() - 0.5) * 0.1 },
        { x: 0.8 + (Math.random() - 0.5) * 0.1, y: 0.75 + (Math.random() - 0.5) * 0.1 },
      ];
    } else if (triangleType < 0.66) {
      // Right triangle
      vertices = [
        { x: 0.2 + Math.random() * 0.1, y: 0.2 + Math.random() * 0.1 },
        { x: 0.8 + (Math.random() - 0.5) * 0.1, y: 0.2 + Math.random() * 0.1 },
        { x: 0.2 + Math.random() * 0.1, y: 0.8 + (Math.random() - 0.5) * 0.1 },
      ];
    } else {
      // Scalene
      vertices = [
        { x: 0.3 + Math.random() * 0.2, y: 0.2 + Math.random() * 0.15 },
        { x: 0.7 + Math.random() * 0.2, y: 0.3 + Math.random() * 0.15 },
        { x: 0.5 + (Math.random() - 0.5) * 0.2, y: 0.8 + (Math.random() - 0.5) * 0.15 },
      ];
    }

    // Some triangles are not fully closed
    const sidesToDraw = Math.random() < 0.15 ? 2 : 3;

    for (let s = 0; s < sidesToDraw; s++) {
      const start = vertices[s];
      const end = vertices[(s + 1) % 3];
      const pointsPerSide = 20 + Math.floor(Math.random() * 20);
      for (let j = 0; j < pointsPerSide; j++) {
        const t = j / pointsPerSide;
        points.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        });
      }
    }

    const noisyPoints = addAirDrawingNoise(points, noiseIntensity);
    data.push({ points: noisyPoints, label: 2 }); // TRIANGLE = 2
  }

  // LINES - with realistic wobble
  for (let i = 0; i < samples; i++) {
    const points = [];
    const startX = 0.15 + Math.random() * 0.2;
    const startY = 0.15 + Math.random() * 0.2;
    const endX = 0.65 + Math.random() * 0.2;
    const endY = 0.65 + Math.random() * 0.2;

    // Some lines are not straight (curved attempts)
    const curvature = Math.random() < 0.3 ? (Math.random() - 0.5) * 0.3 : 0;

    const numPoints = 50 + Math.floor(Math.random() * 50);
    for (let j = 0; j < numPoints; j++) {
      const t = j / numPoints;
      // Add slight curve
      const curveOffset = Math.sin(t * Math.PI) * curvature;
      points.push({
        x: startX + (endX - startX) * t + curveOffset,
        y: startY + (endY - startY) * t + curveOffset,
      });
    }

    const noiseIntensity = 0.3 + Math.random() * 1.5;
    const noisyPoints = addAirDrawingNoise(points, noiseIntensity);
    data.push({ points: noisyPoints, label: 3 }); // LINE = 3
  }

  // UNKNOWN - random scribbles that look like failed shapes
  for (let i = 0; i < samples; i++) {
    const points = [];
    let x = 0.5;
    let y = 0.5;

    // Some are random walks
    if (Math.random() < 0.5) {
      for (let j = 0; j < 80; j++) {
        x += (Math.random() - 0.5) * 0.15;
        y += (Math.random() - 0.5) * 0.15;
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));
        points.push({ x, y });
      }
    } else {
      // Some are partial shapes that don't complete
      const shapeAttempt = Math.random();
      if (shapeAttempt < 0.3) {
        // Partial circle
        for (let j = 0; j < 40; j++) {
          const angle = (j / 80) * Math.PI * 2;
          points.push({
            x: 0.5 + 0.2 * Math.cos(angle) + (Math.random() - 0.5) * 0.05,
            y: 0.5 + 0.2 * Math.sin(angle) + (Math.random() - 0.5) * 0.05,
          });
        }
      } else if (shapeAttempt < 0.6) {
        // Zigzag pattern
        for (let j = 0; j < 60; j++) {
          points.push({
            x: 0.2 + (j / 60) * 0.6,
            y: 0.5 + Math.sin(j * 0.5) * 0.2,
          });
        }
      } else {
        // Loop-de-loop
        for (let j = 0; j < 80; j++) {
          const t = j / 80;
          points.push({
            x: 0.3 + t * 0.4 + Math.sin(t * Math.PI * 4) * 0.1,
            y: 0.5 + Math.cos(t * Math.PI * 3) * 0.2,
          });
        }
      }
    }

    const noiseIntensity = 0.8 + Math.random() * 2.0;
    const noisyPoints = addAirDrawingNoise(points, noiseIntensity);
    data.push({ points: noisyPoints, label: 4 }); // UNKNOWN = 4
  }

  return data;
}

// =========================
// Create & Train Model
// =========================
export async function createModel() {
  if (model) return model;

  console.log("🧠 Creating AI Shape Recognition Model...");

  // Create neural network
  model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [28],
        units: 64,
        activation: "relu",
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({
        units: 32,
        activation: "relu",
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({
        units: 16,
        activation: "relu",
      }),
      tf.layers.dense({
        units: NUM_CLASSES,
        activation: "softmax",
      }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  console.log("✅ Model created. Training...");
  await trainModel();

  return model;
}

async function trainModel() {
  if (isTraining) return;
  isTraining = true;

  try {
    const trainingData = generateTrainingData();

    // Extract features and labels
    const features = trainingData.map((d) => extractFeatures(d.points));
    const labels = trainingData.map((d) => d.label);

    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.oneHot(tf.tensor1d(labels, "int32"), NUM_CLASSES);

    // Train
    await model.fit(xs, ys, {
      epochs: 200,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(
              `Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`
            );
          }
        },
      },
    });

    console.log("✅ Model training complete!");

    // Cleanup
    xs.dispose();
    ys.dispose();
  } catch (err) {
    console.error("Training error:", err);
  } finally {
    isTraining = false;
  }
}

// =========================
// Predict Shape
// =========================
export async function predictShape(points) {
  if (!model) {
    await createModel();
  }

  const features = extractFeatures(points);
  const input = tf.tensor2d([features]);

  const prediction = model.predict(input);
  const probabilities = await prediction.data();
  const index = prediction.argMax(1).dataSync()[0];

  // Cleanup
  input.dispose();
  prediction.dispose();

  const confidence = probabilities[index];
  const shape = SHAPE_LABELS[index];

  return {
    shape,
    confidence: Math.round(confidence * 100),
    allProbabilities: SHAPE_LABELS.map((label, i) => ({
      label,
      probability: Math.round(probabilities[i] * 100),
    })),
  };
}

// =========================
// Get Model Status
// =========================
export function isModelReady() {
  return model !== null;
}

export function isModelTraining() {
  return isTraining;
}
