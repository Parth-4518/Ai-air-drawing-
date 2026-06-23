import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import { detectGesture } from "./Services/GestureController";
import { useEffect, useRef, useState } from "react";
import { createHandTracker } from "./Services/HandTracker";
import Canvas from "./components/Canvas";

import { saveDrawing, getDrawings, deleteDrawing } from "./Services/api";

import { ShapeManager } from "./Services/ShapeManager";

function CameraComponent() {
  const videoRef = useRef(null);

  const handLandmarkerRef = useRef(null);
  const runningRef = useRef(false);

  const lastLogTimeRef = useRef(0);
  const lastGestureRef = useRef("STOP");

  const [mode, setMode] = useState("STOP");
  const [shape, setShape] = useState("NONE");

  const [color, setColor] = useState("black");
  const colorRef = useRef("black");
  const [brushSize, setBrushSize] = useState(5);
  const brushSizeRef = useRef(5);

  // Keep refs in sync with state
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  const [savedDrawings, setSavedDrawings] = useState([]);

  // Video size state
  const [videoSize, setVideoSize] = useState({
    width: 640,
    height: 480,
  });

  // Multi-stroke shape manager
  const shapeManagerRef = useRef(new ShapeManager());
  const [drawables, setDrawables] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const lastPositionRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const video = videoRef.current;
        if (!video || runningRef.current) return;

        runningRef.current = true;

        handLandmarkerRef.current = await createHandTracker();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });

        // Set real camera resolution
        setVideoSize({
          width: video.videoWidth,
          height: video.videoHeight,
        });

        detectHands();
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();
  }, []);

  // =========================
  // HAND TRACKING
  // =========================
  const detectHands = async () => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;

    if (!video || !landmarker) {
      requestAnimationFrame(detectHands);
      return;
    }

    const results = landmarker.detectForVideo(video, performance.now());

    let gesture = "STOP";

    if (results.landmarks?.length > 0) {
      const landmarks = results.landmarks[0];

      gesture = detectGesture(landmarks);
      setMode(gesture);

      const indexFinger = landmarks[8];

      // Use videoSize for coordinate mapping
      const x = Math.round(indexFinger.x * videoSize.width);
      const y = Math.round(indexFinger.y * videoSize.height);

      const now = Date.now();

      const shapeManager = shapeManagerRef.current;

      // =========================
      // DRAW
      // =========================
      if (gesture === "DRAW" && now - lastLogTimeRef.current > 25) {
        // Start new stroke if not already drawing
        if (!shapeManager.isDrawing) {
          shapeManager.startStroke({ x, y }, colorRef.current, brushSizeRef.current);
        } else {
          shapeManager.addPoint({ x, y });
        }

        setDrawables([...shapeManager.getAllDrawables()]);
        setShape("DRAWING...");

        lastLogTimeRef.current = now;
      }

      // =========================
      // CLEAR (all shapes)
      // =========================
      if (gesture === "CLEAR") {
        shapeManager.clear();
        setDrawables([]);
        setShape("NONE");
        setSelectedShapeId(null);
      }

      // =========================
      // DELETE (selected shape)
      // =========================
      if (gesture === "DELETE") {
        shapeManager.deleteSelected();
        setDrawables([...shapeManager.getAllDrawables()]);
        setSelectedShapeId(null);
        setShape("DELETED");
      }

      // =========================
      // STOP → Finalize stroke (no shape correction)
      // =========================
      const wasDrawing = lastGestureRef.current === "DRAW";

      if (
        gesture === "STOP" &&
        wasDrawing &&
        shapeManager.isDrawing
      ) {
        const completed = shapeManager.endStroke((points) => ({
          shape: "freehand",
          confidence: 0,
          correctedPoints: points,
        }));

        if (completed) {
          setShape("FREEHAND");
        } else {
          setShape("NONE");
        }

        setDrawables([...shapeManager.getAllDrawables()]);
      }

      // =========================
      // SELECT (hover over shape)
      // =========================
      if (gesture === "STOP" && !shapeManager.isDrawing) {
        const selected = shapeManager.selectShapeAt({ x, y }, 40);
        if (selected) {
          setSelectedShapeId(selected.id);
        } else {
          setSelectedShapeId(null);
        }
      }

      // =========================
      // MOVE selected shape
      // =========================
      if (gesture === "DRAW" && selectedShapeId && !shapeManager.isDrawing) {
        if (lastPositionRef.current) {
          const dx = x - lastPositionRef.current.x;
          const dy = y - lastPositionRef.current.y;
          shapeManager.moveSelected(dx, dy);
          setDrawables([...shapeManager.getAllDrawables()]);
        }
        lastPositionRef.current = { x, y };
      } else {
        lastPositionRef.current = null;
      }

      lastGestureRef.current = gesture;
    }

    requestAnimationFrame(detectHands);
  };

  // =========================
  // CLEAR
  // =========================
  const clearCanvas = () => {
    shapeManagerRef.current.clear();
    setDrawables([]);
    setShape("NONE");
    setSelectedShapeId(null);
  };

  // =========================
  // UNDO
  // =========================
  const undo = () => {
    shapeManagerRef.current.undo();
    setDrawables([...shapeManagerRef.current.getAllDrawables()]);
  };

  // =========================
  // DELETE SELECTED
  // =========================
  const deleteSelected = () => {
    shapeManagerRef.current.deleteSelected();
    setDrawables([...shapeManagerRef.current.getAllDrawables()]);
    setSelectedShapeId(null);
  };

  // =========================
  // SAVE
  // =========================
  const saveCanvas = async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    try {
      const image = canvas.toDataURL("image/png");
      const token = localStorage.getItem("token");

      await saveDrawing(
        {
          image,
          name: `Drawing ${Date.now()}`,
          color,
          brushSize,
          detectedShape: shape,
        },
        token
      );

      alert("Drawing Saved Successfully!");
      fetchDrawings();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // =========================
  // LOAD DRAWINGS
  // =========================
  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      const res = await getDrawings();

      const data =
        res?.data?.data ||
        res?.data?.drawings ||
        res?.data ||
        [];

      setSavedDrawings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching drawings:", err);
      setSavedDrawings([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await deleteDrawing(id, token);
      fetchDrawings();
    } catch (err) {
      console.error(err);
    }
  };

  const drawings = Array.isArray(savedDrawings) ? savedDrawings : [];

  return (
    <div className="camera-container">
      <Topbar mode={mode} shape={shape} clearCanvas={clearCanvas} saveCanvas={saveCanvas} />
      <Sidebar 
        currentColor={color} 
        currentBrushSize={brushSize} 
        detectedShape={shape} 
      />

      <div className="canvas-area" style={{ marginLeft: '260px', marginTop: '64px', padding: '20px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="video-feed"
          style={{ width: '100%', maxWidth: '1080px', height: 'auto' }}
        />

        <Canvas
          drawables={drawables}
          color={color}
          brushSize={brushSize}
          videoSize={videoSize}
          selectedShapeId={selectedShapeId}
        />
      </div>

      <Toolbar
        setColor={setColor}
        setBrushSize={setBrushSize}
        clearCanvas={clearCanvas}
        saveCanvas={saveCanvas}
        undo={undo}
        redo={() => {}}
        currentColor={color}
        currentBrushSize={brushSize}
      />

      <style jsx>{`
        .camera-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-primary);
          display: flex;
          transition: background 0.3s ease;
        }

        .canvas-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 260px;
          margin-top: 64px;
          position: relative;
          overflow: hidden;
        }

        .video-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}

export default CameraComponent;