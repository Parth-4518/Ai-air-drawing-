export default function Topbar({ clearCanvas, saveCanvas }) {
  return (
    <div style={styles.topbar}>
      <h2>✏️ Air Draw</h2>

      <div>
        <button onClick={saveCanvas}>Save</button>
        <button onClick={clearCanvas}>Clear</button>
      </div>
    </div>
  );
}

const styles = {
  topbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50px",
    background: "#222",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
  },
};