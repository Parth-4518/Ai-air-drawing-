export const extractFeatures = (points) => {
  if (!points || points.length === 0) {
    return [0, 0, 0, 0, 0];
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let totalDistance = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;

    totalDistance += Math.sqrt(dx * dx + dy * dy);

    minX = Math.min(minX, points[i].x);
    maxX = Math.max(maxX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxY = Math.max(maxY, points[i].y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  return [
    points.length,                 // density
    width,                        // shape width
    height,                       // shape height
    totalDistance,               // stroke length
    width / (height + 1)         // ratio
  ];
};