import { FaHandPaper, FaPencilAlt, FaEraser, FaMagic, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export default function Topbar({ mode, shape, clearCanvas, saveCanvas }) {
  const { theme, toggleTheme } = useTheme();
  const getModeIcon = () => {
    switch (mode) {
      case "DRAW": return <FaPencilAlt className="mode-icon draw" />;
      case "CLEAR": return <FaEraser className="mode-icon clear" />;
      case "STOP": return <FaHandPaper className="mode-icon stop" />;
      default: return <FaHandPaper className="mode-icon stop" />;
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "DRAW": return "#10B981";
      case "CLEAR": return "#EF4444";
      case "STOP": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo">
          <FaMagic className="logo-icon" />
          <span>AirDraw AI</span>
        </div>
      </div>

      <div className="topbar-center">
        <div className="status-indicator" style={{ borderColor: getModeColor() }}>
          {getModeIcon()}
          <div className="status-text">
            <span className="status-label" style={{ color: getModeColor() }}>{mode}</span>
            <span className="status-shape">{shape !== "NONE" && shape !== "DRAWING..." ? `→ ${shape}` : ""}</span>
          </div>
        </div>
      </div>

      <div className="topbar-right" style={{ marginTop: '8px' }}>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>
        <button className="action-btn clear-btn" onClick={clearCanvas}>
          <FaEraser />
          <span>Clear</span>
        </button>
        <button className="action-btn save-btn" onClick={saveCanvas}>
          <FaMagic />
          <span>Save</span>
        </button>
      </div>

      <style jsx>{`
        .topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: rgba(15, 15, 25, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 1000;
        }

        .topbar-left {
          display: flex;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .logo-icon {
          font-size: 24px;
          color: #3B82F6;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
        }

        .topbar-center {
          display: flex;
          align-items: center;
        }
        .topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--bg-secondary);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 1000;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 20px;
          background: var(--btn-bg);
          border: 2px solid;
          border-radius: 100px;
          transition: all 0.3s ease;
        }

        .status-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-label {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .status-shape {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          border: none;
          background: var(--btn-bg);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--btn-hover);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .clear-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
        }

        .save-btn:hover {
          background: rgba(59, 130, 246, 0.15);
          color: #3B82F6;
        }

        .theme-toggle {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: none;
          background: var(--btn-bg);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 18px;
        }

        .theme-toggle:hover {
          background: var(--btn-hover);
          color: var(--text-primary);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
