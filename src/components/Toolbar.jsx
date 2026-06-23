import { useState } from "react";
import { FaPencilAlt, FaEraser, FaUndo, FaRedo, FaSave, FaTrash, FaDownload, FaPalette, FaCircle, FaSquare, FaPlay, FaStop, FaHandPaper, FaMagic } from "react-icons/fa";

function Toolbar({ setColor, setBrushSize, clearCanvas, saveCanvas, undo, redo, currentColor, currentBrushSize }) {
  const [activeTab, setActiveTab] = useState("draw");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const colors = [
    { name: "Black", value: "#000000", bg: "bg-black" },
    { name: "White", value: "#FFFFFF", bg: "bg-white" },
    { name: "Red", value: "#EF4444", bg: "bg-red-500" },
    { name: "Blue", value: "#3B82F6", bg: "bg-blue-500" },
    { name: "Green", value: "#10B981", bg: "bg-green-500" },
    { name: "Yellow", value: "#F59E0B", bg: "bg-yellow-500" },
    { name: "Purple", value: "#8B5CF6", bg: "bg-purple-500" },
    { name: "Pink", value: "#EC4899", bg: "bg-pink-500" },
    { name: "Cyan", value: "#06B6D4", bg: "bg-cyan-500" },
    { name: "Orange", value: "#F97316", bg: "bg-orange-500" },
    { name: "Lime", value: "#84CC16", bg: "bg-lime-500" },
    { name: "Indigo", value: "#6366F1", bg: "bg-indigo-500" },
    { name: "Teal", value: "#14B8A6", bg: "bg-teal-500" },
    { name: "Magenta", value: "#D946EF", bg: "bg-fuchsia-500" },
    { name: "Gold", value: "#EAB308", bg: "bg-yellow-600" },
  ];

  const brushSizes = [
    { label: "Thin", value: 2, preview: "w-1 h-1" },
    { label: "Light", value: 4, preview: "w-2 h-2" },
    { label: "Medium", value: 8, preview: "w-3 h-3" },
    { label: "Bold", value: 12, preview: "w-4 h-4" },
    { label: "Thick", value: 20, preview: "w-5 h-5" },
  ];

  return (
    <div className="toolbar-container">
      {/* Main Toolbar */}
      <div className="toolbar-main">
        {/* Drawing Tools */}
        <div className="toolbar-section">
          <button
            className={`tool-btn ${activeTab === "draw" ? "active" : ""}`}
            onClick={() => setActiveTab("draw")}
            title="Draw"
          >
            <FaPencilAlt />
          </button>
          <button
            className={`tool-btn ${activeTab === "erase" ? "active" : ""}`}
            onClick={() => setActiveTab("erase")}
            title="Erase"
          >
            <FaEraser />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Color Picker */}
        <div className="toolbar-section">
          <button
            className="tool-btn color-btn"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Colors"
            style={{ backgroundColor: currentColor }}
          >
            <FaPalette />
          </button>
          
          {showColorPicker && (
            <div className="color-picker-dropdown">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${currentColor === color.value ? "selected" : ""}`}
                  onClick={() => {
                    setColor(color.value);
                    setShowColorPicker(false);
                  }}
                  title={color.name}
                >
                  <div className={`color-circle ${color.bg}`} />
                </button>
              ))}
              {/* Custom Color Input */}
              <div className="custom-color-wrapper">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setShowColorPicker(false);
                  }}
                  className="custom-color-input"
                  title="Custom Color"
                />
                <span className="custom-color-label">Custom</span>
              </div>
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Brush Size */}
        <div className="toolbar-section">
          <button
            className="tool-btn size-btn"
            onClick={() => setShowSizePicker(!showSizePicker)}
            title="Brush Size"
          >
            <div className={`size-preview ${brushSizes.find(s => s.value === currentBrushSize)?.preview || "w-3 h-3"}`} />
          </button>
          
          {showSizePicker && (
            <div className="size-picker-dropdown">
              {brushSizes.map((size) => (
                <button
                  key={size.value}
                  className={`size-option ${currentBrushSize === size.value ? "selected" : ""}`}
                  onClick={() => {
                    setBrushSize(size.value);
                    setShowSizePicker(false);
                  }}
                >
                  <div className={`size-dot ${size.preview}`} />
                  <span>{size.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Actions */}
        <div className="toolbar-section">
          <button className="tool-btn action-btn" onClick={undo} title="Undo">
            <FaUndo />
          </button>
          <button className="tool-btn action-btn" onClick={redo} title="Redo">
            <FaRedo />
          </button>
          <button className="tool-btn action-btn danger" onClick={clearCanvas} title="Clear">
            <FaTrash />
          </button>
          <button className="tool-btn action-btn primary" onClick={saveCanvas} title="Save">
            <FaSave />
          </button>
        </div>
      </div>

      <style jsx>{`
        .toolbar-container {
          position: fixed;
          top: 140px;
          right: 20px;
          z-index: 100;
        }

        .toolbar-main {
          background: var(--bg-panel);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .toolbar-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .toolbar-divider {
          height: 1px;
          background: var(--border-color);
          margin: 4px 0;
        }

        .tool-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 2px solid transparent;
          background: var(--btn-bg);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .tool-btn:hover {
          background: var(--btn-hover);
          color: var(--text-primary);
          transform: translateY(-2px);
        }

        .tool-btn.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3B82F6;
          color: #3B82F6;
        }

        .color-btn {
          position: relative;
          overflow: hidden;
        }

        .color-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
        }

        .size-btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .size-preview {
          border-radius: 50%;
          background: currentColor;
        }

        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        .action-btn.primary:hover {
          background: rgba(59, 130, 246, 0.2);
          color: #3B82F6;
        }

        .color-picker-dropdown {
          position: absolute;
          right: 56px;
          top: 0;
          background: var(--bg-panel);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 200;
          min-width: 200px;
        }

        .custom-color-wrapper {
          grid-column: span 5;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: var(--btn-bg);
          border-radius: 8px;
          margin-top: 4px;
        }

        .custom-color-input {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          background: transparent;
        }

        .custom-color-label {
          color: var(--text-secondary);
          font-size: 12px;
        }

        .color-option {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid transparent;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: #3B82F6;
        }

        .color-circle {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .size-picker-dropdown {
          position: absolute;
          right: 56px;
          top: 0;
          background: var(--bg-panel);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 200;
          min-width: 120px;
        }

        .size-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .size-option:hover {
          background: var(--btn-bg);
          color: var(--text-primary);
        }

        .size-option.selected {
          background: rgba(59, 130, 246, 0.2);
          color: #3B82F6;
        }

        .size-dot {
          border-radius: 50%;
          background: currentColor;
        }

        .size-option span {
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

export default Toolbar;