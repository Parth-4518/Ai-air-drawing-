import { FaHandPaper, FaPencilAlt, FaEraser, FaInfoCircle, FaLightbulb, FaCircle, FaSquare, FaPlay, FaStop } from "react-icons/fa";

export default function Sidebar({ currentColor, currentBrushSize, detectedShape }) {
  const gestures = [
    { icon: <FaPencilAlt />, name: "DRAW", desc: "Index finger up", color: "#10B981" },
    { icon: <FaHandPaper />, name: "STOP", desc: "Open palm", color: "#F59E0B" },
    { icon: <FaEraser />, name: "CLEAR", desc: "Fist gesture", color: "#EF4444" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaLightbulb className="header-icon" />
        <h3>Guide</h3>
      </div>

      {/* Gesture Guide */}
      <div className="section">
        <h4 className="section-title">Gestures</h4>
        <div className="gesture-list">
          {gestures.map((g) => (
            <div key={g.name} className="gesture-item">
              <div className="gesture-icon" style={{ color: g.color }}>
                {g.icon}
              </div>
              <div className="gesture-info">
                <span className="gesture-name" style={{ color: g.color }}>{g.name}</span>
                <span className="gesture-desc">{g.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Current Settings */}
      <div className="section">
        <h4 className="section-title">Current Settings</h4>
        <div className="setting-item">
          <span className="setting-label">Color</span>
          <div className="color-info">
            <div className="color-preview" style={{ backgroundColor: currentColor }} />
            <span className="color-name">{currentColor}</span>
          </div>
        </div>
        <div className="setting-item">
          <span className="setting-label">Brush</span>
          <div className="size-preview">
            <div 
              className="size-dot" 
              style={{ 
                width: currentBrushSize, 
                height: currentBrushSize,
                backgroundColor: currentColor 
              }} 
            />
            <span>{currentBrushSize}px</span>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Shape Detection */}
      <div className="section">
        <h4 className="section-title">Detected Shape</h4>
        <div className="shape-display">
          {detectedShape && detectedShape !== "NONE" && detectedShape !== "DRAWING..." ? (
            <div className="shape-result">
              <FaCircle className="shape-icon" />
              <span className="shape-name">{detectedShape}</span>
            </div>
          ) : (
            <div className="shape-placeholder">
              <FaInfoCircle />
              <span>Draw a shape to detect</span>
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      {/* Tips */}
      <div className="section">
        <h4 className="section-title">Tips</h4>
        <ul className="tips-list">
          <li>Keep hand steady while drawing</li>
          <li>Make shapes closed for better detection</li>
          <li>Use STOP gesture to finish drawing</li>
          <li>Draw bigger shapes for accuracy</li>
        </ul>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 64px;
          width: 260px;
          height: calc(100vh - 64px);
          background: var(--sidebar-bg);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border-color);
          padding: 20px;
          overflow-y: auto;
          z-index: 100;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-header h3 {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .section-title {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .gesture-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--btn-bg);
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .gesture-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .divider {
          height: 1px;
          background: var(--border-color);
          margin: 16px 0;
        }

        .setting-label {
          color: var(--text-secondary);
          font-size: 13px;
        }

        .color-name {
          color: var(--text-muted);
          font-size: 11px;
          font-family: monospace;
        }

        .size-preview span {
          color: var(--text-muted);
          font-size: 12px;
        }

        .shape-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }

        .tips-list li {
          color: var(--text-secondary);
          font-size: 12px;
          padding-left: 16px;
          position: relative;
        }

        .shape-name {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 600;
        }

        .shape-display {
          padding: 16px;
          background: var(--btn-bg);
          border-radius: 12px;
          text-align: center;
        }

        .color-preview {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 2px solid var(--border-color);
        }

        .gesture-icon {
          font-size: 18px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--btn-bg);
          border-radius: 8px;
        }

        .gesture-item:hover {
          background: var(--btn-hover);
        }

        .size-dot {
          border-radius: 50%;
        }

        .shape-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .shape-icon {
          font-size: 32px;
          color: #3B82F6;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
        }

        .shape-placeholder span {
          font-size: 12px;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tips-list li::before {
          content: "•";
          position: absolute;
          left: 4px;
          color: #3B82F6;
        }
      `}</style>
    </div>
  );
}
