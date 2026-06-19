import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import { detectGesture } from "./Services/GestureController";
import { detectShape } from "./Services/ShapeDetector";
import { useEffect, useRef, useState } from "react";
import { createHandTracker } from "./Services/HandTracker";
import Canvas from "./components/Canvas";

import { saveDrawing, getDrawings, deleteDrawing } from "./Services/api";

function CameraComponent() {
  const videoRef = useRef(null);

  const handLandmarkerRef = useRef(null);
  const runningRef = useRef(false);

  const lastLogTimeRef = useRef(0);

  const pointsRef = useRef([]);
  const lastGestureRef = useRef("STOP");

  const [points, setPoints] = useState([]);
  const [mode, setMode] = useState("STOP");
  const [shape, setShape] = useState("NONE");

  const [color, setColor] = useState("black");
  const [brushSize, setBrushSize] = useState(5);

  const [savedDrawings, setSavedDrawings] = useState([]);

  // =========================
  // CAMERA START
  // =========================
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

        detectHands();
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();
  }, []);

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

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0 ||
      video.readyState < 2
    ) {
      requestAnimationFrame(detectHands);
      return;
    }

    const results = landmarker.detectForVideo(video, performance.now());

    if (results.landmarks?.length > 0) {
      const landmarks = results.landmarks[0];

      const gesture = detectGesture(landmarks);
      setMode(gesture);

      const indexFinger = landmarks[8];

      const x = Math.round(indexFinger.x * video.videoWidth);
      const y = Math.round(indexFinger.y * video.videoHeight);

      const now = Date.now();

      if (gesture === "DRAW" && now - lastLogTimeRef.current > 30) {
        pointsRef.current.push({ x, y });
        setPoints([...pointsRef.current]);
        lastLogTimeRef.current = now;
      }

      if (gesture === "CLEAR") {
        pointsRef.current = [];
        setPoints([]);
        setShape("NONE");
      }

      if (
        gesture === "STOP" &&
        lastGestureRef.current !== "STOP" &&
        pointsRef.current.length > 80
      ) {
        const result = detectShape([...pointsRef.current]);
        setShape(result);
      }

      lastGestureRef.current = gesture;
    }

    requestAnimationFrame(detectHands);
  };

  // =========================
  // CLEAR
  // =========================
  const clearCanvas = () => {
    pointsRef.current = [];
    setPoints([]);
    setShape("NONE");
  };

  // =========================
  // SAVE (PHASE 10 FIXED)
  // =========================
  const saveCanvas = async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    try {
      // 🖼️ Convert canvas to image
      const image = canvas.toDataURL("image/png");

      await saveDrawing({
        userId: "USER_ID_HERE", // replace later with login
        image,
        name: `Drawing ${Date.now()}`,
        color,
        brushSize,
        detectedShape: shape,
      });

      alert("Drawing Saved Successfully!");
      fetchDrawings();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    try {
      await deleteDrawing(id);
      fetchDrawings();
    } catch (err) {
      console.error(err);
    }
  };

  const drawings = Array.isArray(savedDrawings) ? savedDrawings : [];

  return (
    <div style={{ position: "relative" }}>
      <Topbar clearCanvas={clearCanvas} saveCanvas={saveCanvas} />

      <Sidebar setColor={setColor} setBrushSize={setBrushSize} />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="640"
        height="480"
        style={{ marginLeft: "200px", marginTop: "60px" }}
      />

      <Toolbar
        setColor={setColor}
        setBrushSize={setBrushSize}
        clearCanvas={clearCanvas}
        saveCanvas={saveCanvas}
      />

      <h3>Mode: {mode}</h3>
      <h3>Shape: {shape}</h3>

      <Canvas points={points} color={color} brushSize={brushSize} />

      {/* SAVED DRAWINGS */}
      <div style={{ marginTop: "20px" }}>
        <h2>Saved Drawings</h2>

        {drawings.length === 0 ? (
          <p>No drawings saved yet.</p>
        ) : (
          <ul>
            {drawings.map((d) => (
              <li key={d._id}>
                {d.name} ({d.detectedShape})
                <button onClick={() => handleDelete(d._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CameraComponent;