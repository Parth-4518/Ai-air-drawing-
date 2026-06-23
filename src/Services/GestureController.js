export const detectGesture = (landmarks) => {
  const fingers = {
    thumb: landmarks[4],
    index: landmarks[8],
    middle: landmarks[12],
    ring: landmarks[16],
    pinky: landmarks[20],
  };

  const isFingerUp = (tip, pip) => {
    return tip.y < pip.y;
  };

  const indexUp = isFingerUp(landmarks[8], landmarks[6]);
  const middleUp = isFingerUp(landmarks[12], landmarks[10]);
  const ringUp = isFingerUp(landmarks[16], landmarks[14]);
  const pinkyUp = isFingerUp(landmarks[20], landmarks[18]);

  const allUp = indexUp && middleUp && ringUp && pinkyUp;
  const fist = !indexUp && !middleUp && !ringUp && !pinkyUp;
  const twoFingers = indexUp && middleUp && !ringUp && !pinkyUp;
  const threeFingers = indexUp && middleUp && ringUp && !pinkyUp;

  // 🎯 GESTURE RULES

  if (allUp) return "CLEAR";

  if (fist) return "STOP";

  if (twoFingers) return "TOOLBAR";

  if (threeFingers) return "DELETE";

  if (indexUp && !middleUp) return "DRAW";

  return "NONE";
};