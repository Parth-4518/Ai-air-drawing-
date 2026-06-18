import { detectGesture } from "./Services/GestureController";
import { useEffect, useRef, useState } from "react";
import { createHandTracker } from "./Services/HandTracker";
import Canvas from "./components/Canvas";

function CameraComponent() {
  const videoRef = useRef(null);
  const lastLogTimeRef = useRef(0);

  const [points, setPoints] = useState([]);
  const [mode, setMode] = useState("STOP");

  useEffect(() => {
    let handLandmarker;

    const startCamera = async () => {
      handLandmarker = await createHandTracker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;

      videoRef.current.onloadeddata = () => {
        detectHands();
      };
    };

    const detectHands = async () => {
      if (!videoRef.current || !handLandmarker) return;

      const results = handLandmarker.detectForVideo(
        videoRef.current,
        performance.now()
      );

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // ✋ STEP 1: detect gesture
        const gesture = detectGesture(landmarks);
        setMode(gesture);

        // ✋ index finger position
        const indexFinger = landmarks[8];

        const x = Math.round(indexFinger.x * 640);
        const y = Math.round(indexFinger.y * 480);

        const now = Date.now();

        // ✍️ DRAW ONLY WHEN gesture = DRAW
        if (gesture === "DRAW" && now - lastLogTimeRef.current > 30) {
          setPoints((prev) => [...prev, { x, y }]);
          lastLogTimeRef.current = now;
        }

        // 🧼 CLEAR SCREEN
        if (gesture === "CLEAR") {
          setPoints([]);
        }
      }

      requestAnimationFrame(detectHands);
    };

    startCamera();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="640"
        height="480"
      />

      {/* Show current mode (debug) */}
      <h3>Mode: {mode}</h3>

      {/* Drawing layer */}
      <Canvas points={points} />
    </div>
  );
}

export default CameraComponent;