import { useState } from "react";

function Toolbar({ setColor, setBrushSize, clearCanvas, saveCanvas }) {
  const [activeColor, setActiveColor] = useState("black");
  const [activeSize, setActiveSize] = useState("medium");

  // 🎨 COLORS
  const colors = ["black", "red", "blue", "green"];

  // 🖌️ BRUSH SIZES
  const sizes = [
    { label: "Small", value: 2 },
    { label: "Medium", value: 5 },
    { label: "Large", value: 10 },
  ];

  return (
    <div style={styles.toolbar}>
      {/* COLOR PICKER */}
      <div>
        <h4>Colors</h4>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => {
              setColor(color);
              setActiveColor(color);
            }}
            style={{
              ...styles.button,
              backgroundColor: color,
              border:
                activeColor === color ? "3px solid white" : "1px solid gray",
            }}
          />
        ))}
      </div>

      {/* BRUSH SIZE */}
      <div>
        <h4>Brush Size</h4>
        {sizes.map((size) => (
          <button
            key={size.label}
            onClick={() => {
              setBrushSize(size.value);
              setActiveSize(size.label);
            }}
            style={{
              ...styles.sizeBtn,
              border:
                activeSize === size.label
                  ? "2px solid white"
                  : "1px solid gray",
            }}
          >
            {size.label}
          </button>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div>
        <h4>Actions</h4>

        <button style={styles.actionBtn} onClick={clearCanvas}>
          Clear
        </button>

        <button style={styles.actionBtn} onClick={saveCanvas}>
          Save
        </button>
      </div>
    </div>
  );
}

const styles = {
  toolbar: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "#222",
    padding: "10px",
    borderRadius: "10px",
    color: "white",
  },
  button: {
    width: "25px",
    height: "25px",
    margin: "5px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  sizeBtn: {
    margin: "5px",
    padding: "5px",
    cursor: "pointer",
  },
  actionBtn: {
    display: "block",
    margin: "5px 0",
    padding: "5px",
    width: "100%",
    cursor: "pointer",
  },
};

export default Toolbar;