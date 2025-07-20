import React from "react";

const colors = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#ff0000" },
  { name: "Blue", value: "#0000ff" },
  { name: "Green", value: "#008000" },
];

const Toolbar = ({ color, setColor, strokeWidth, setStrokeWidth, onClear }) => {
  return (
    <div
      className="toolbar"
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <label>
        Color:
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          {colors.map((c) => (
            <option key={c.value} value={c.value}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Stroke Width:
        <input
          type="range"
          min={2}
          max={16}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
        />
        <span>{strokeWidth}px</span>
      </label>
      <button onClick={onClear}>Clear Canvas</button>
    </div>
  );
};

export default Toolbar;
