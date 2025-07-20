import React, { useRef, useEffect } from "react";

const DrawingCanvas = ({ color, strokeWidth, onClear, socket, roomId }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const drawLine = (from, to, color, width) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const drawStroke = (stroke) => {
    const { points, color, strokeWidth } = stroke;
    if (!points || points.length < 2) return;
    for (let i = 1; i < points.length; i++) {
      drawLine(points[i - 1], points[i], color, strokeWidth);
    }
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    drawing.current = true;
    const pos = getPos(e);
    lastPoint.current = pos;
    if (socket && roomId) {
      socket.emit("draw-start", { pos, color, strokeWidth });
    }
  };

  const handlePointerMove = (e) => {
    if (!drawing.current) return;
    const pos = getPos(e);
    drawLine(lastPoint.current, pos, color, strokeWidth);
    if (socket && roomId) {
      socket.emit("draw-move", {
        from: lastPoint.current,
        to: pos,
        color,
        strokeWidth,
      });
    }
    lastPoint.current = pos;
  };

  const handlePointerUp = () => {
    if (drawing.current && socket && roomId) {
      socket.emit("draw-end", {});
    }
    drawing.current = false;
  };

  useEffect(() => {
    if (!socket) return;
    const handleDrawStart = ({ pos }) => {
      lastPoint.current = pos;
    };
    const handleDrawMove = ({ from, to, color, strokeWidth }) => {
      drawLine(from, to, color, strokeWidth);
      lastPoint.current = to;
    };
    const handleDrawEnd = () => {
      drawing.current = false;
    };
    const handleClear = () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    socket.on("draw-start", handleDrawStart);
    socket.on("draw-move", handleDrawMove);
    socket.on("draw-end", handleDrawEnd);
    socket.on("clear-canvas", handleClear);
    socket.on("init-drawing-data", (data) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (Array.isArray(data)) {
        data.forEach((cmd) => {
          if (cmd.type === "stroke") {
            drawStroke(cmd.data);
          } else if (cmd.type === "clear") {
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          }
        });
      }
    });
    return () => {
      socket.off("draw-start", handleDrawStart);
      socket.off("draw-move", handleDrawMove);
      socket.off("draw-end", handleDrawEnd);
      socket.off("clear-canvas");
      socket.off("init-drawing-data");
    };
  }, [socket]);

  useEffect(() => {
    if (!onClear) return;
    const clear = () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    onClear.clearCanvas = clear;
  }, [onClear]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={600}
      style={{
        border: "1px solid #ccc",
        background: "#fff",
        touchAction: "none",
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  );
};

export default DrawingCanvas;
