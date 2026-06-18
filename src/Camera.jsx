import Toolbar from "./components/Toolbar";
import { detectGesture } from "./Services/GestureController";
import { detectShape } from "./Services/ShapeDetector";
import { useEffect, useRef, useState } from "react";
import { createHandTracker } from "./Services/HandTracker";
import Canvas from "./components/Canvas";

function CameraComponent() {
  const videoRef = useRef(null);

  const handLandmarkerRef = useRef(null);
  const runningRef = useRef(false);

  const lastLogTimeRef = useRef(0);

  // 🔥 IMPORTANT: use ref for stable points (fixes instability)
  const pointsRef = useRef([]);

  const lastGestureRef = useRef("STOP");

  const [points, setPoints] = useState([]);
  const [mode, setMode] = useState("STOP");
  const [shape, setShape] = useState("NONE");

  useEffect(() => {
    const startCamera = async () => {
      handLandmarkerRef.current = await createHandTracker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const video = videoRef.current;
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadeddata = () => resolve();
      });

      if (!runningRef.current) {
        runningRef.current = true;
        detectHands();
      }
    };

    startCamera();
  }, []);

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

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];

      const gesture = detectGesture(landmarks);
      setMode(gesture);

      const indexFinger = landmarks[8];

      const x = Math.round(indexFinger.x * video.videoWidth);
      const y = Math.round(indexFinger.y * video.videoHeight);

      const now = Date.now();

      // ✍️ DRAW MODE (use ref instead of state)
      if (gesture === "DRAW" && now - lastLogTimeRef.current > 30) {
        pointsRef.current.push({ x, y });

        setPoints([...pointsRef.current]); // UI update only

        lastLogTimeRef.current = now;
      }

      // 🧼 CLEAR
      if (gesture === "CLEAR") {
        pointsRef.current = [];
        setPoints([]);
        setShape("NONE");
      }

      // 🔥 STOP → FINAL SHAPE DETECTION (STABLE)
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

  const clearCanvas = () => {
    pointsRef.current = [];
    setPoints([]);
    setShape("NONE");
  };

  const saveCanvas = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="640"
        height="480"
      />

      <Toolbar
        setColor={() => {}}
        setBrushSize={() => {}}
        clearCanvas={clearCanvas}
        saveCanvas={saveCanvas}
      />

      <h3>Mode: {mode}</h3>
      <h3>Shape: {shape}</h3>

      <Canvas
        points={points}
        color="black"
        brushSize={5}
      />
    </div>
  );
}

export default CameraComponent;