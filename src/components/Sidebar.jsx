export default function Sidebar({ setColor, setBrushSize }) {
  return (
    <div style={styles.sidebar}>
      <h3>Tools</h3>

      <label>Color</label>
      <input
        type="color"
        onChange={(e) => setColor(e.target.value)}
      />

      <label>Brush Size</label>
      <input
        type="range"
        min="1"
        max="20"
        onChange={(e) => setBrushSize(e.target.value)}
      />
    </div>
  );
}

const styles = {
  sidebar: {
    position: "absolute",
    left: 0,
    top: 60,
    width: "200px",
    height: "100vh",
    background: "#111",
    color: "white",
    padding: "10px",
  },
};