import Camera from "./Camera";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Camera />
      </div>
    </ThemeProvider>
  );
}

export default App;