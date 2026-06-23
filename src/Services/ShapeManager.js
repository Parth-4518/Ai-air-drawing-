// =========================
// 🎯 Multi-Stroke Shape Manager
// =========================

export class ShapeManager {
  constructor() {
    this.shapes = [];           // completed shapes
    this.currentStroke = [];    // currently drawing
    this.isDrawing = false;
    this.selectedShapeId = null;
    this.nextId = 1;
  }

  startStroke(point, color, brushSize) {
    this.currentStroke = {
      id: this.nextId++,
      points: [point],
      color,
      brushSize,
      startTime: Date.now(),
      shape: null,
      confidence: 0,
    };
    this.isDrawing = true;
  }

  addPoint(point) {
    if (!this.isDrawing || !this.currentStroke) return;
    this.currentStroke.points.push(point);
  }

  endStroke(shapeRecognizerFn) {
    if (!this.isDrawing || !this.currentStroke) return null;

    const stroke = this.currentStroke;
    this.isDrawing = false;

    // Only process if enough points (lowered to 3 for short lines)
    if (stroke.points.length < 3) {
      this.currentStroke = null;
      return null;
    }

    // Run shape recognition
    const result = shapeRecognizerFn(stroke.points);
    stroke.shape = result.shape;
    stroke.confidence = result.confidence;
    stroke.correctedPoints = result.correctedPoints || stroke.points;

    this.shapes.push(stroke);
    this.currentStroke = null;

    return stroke;
  }

  // Get all completed shapes + current stroke
  getAllDrawables() {
    const drawables = [...this.shapes];
    if (this.isDrawing && this.currentStroke) {
      drawables.push(this.currentStroke);
    }
    return drawables;
  }

  // Select shape at point
  selectShapeAt(point, threshold = 30) {
    let closest = null;
    let minDist = Infinity;

    for (const shape of this.shapes) {
      const points = shape.correctedPoints || shape.points;
      for (const p of points) {
        const dist = Math.sqrt((p.x - point.x) ** 2 + (p.y - point.y) ** 2);
        if (dist < minDist && dist < threshold) {
          minDist = dist;
          closest = shape;
        }
      }
    }

    this.selectedShapeId = closest ? closest.id : null;
    return closest;
  }

  // Move selected shape
  moveSelected(deltaX, deltaY) {
    const shape = this.shapes.find(s => s.id === this.selectedShapeId);
    if (!shape) return false;

    const movePoint = (p) => ({ x: p.x + deltaX, y: p.y + deltaY });

    shape.points = shape.points.map(movePoint);
    if (shape.correctedPoints) {
      shape.correctedPoints = shape.correctedPoints.map(movePoint);
    }

    return true;
  }

  // Delete selected shape
  deleteSelected() {
    if (!this.selectedShapeId) return false;
    this.shapes = this.shapes.filter(s => s.id !== this.selectedShapeId);
    this.selectedShapeId = null;
    return true;
  }

  // Delete last shape (undo-like)
  undo() {
    if (this.shapes.length === 0) return false;
    this.shapes.pop();
    return true;
  }

  // Clear all
  clear() {
    this.shapes = [];
    this.currentStroke = null;
    this.isDrawing = false;
    this.selectedShapeId = null;
  }

  // Get selected shape
  getSelected() {
    return this.shapes.find(s => s.id === this.selectedShapeId) || null;
  }
}

export default ShapeManager;
