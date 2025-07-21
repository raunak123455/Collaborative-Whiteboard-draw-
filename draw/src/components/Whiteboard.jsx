import React, { useState, useRef, useEffect } from "react";
import DrawingCanvas from "./DrawingCanvas";
import Toolbar from "./Toolbar";
import UserCursors from "./UserCursors";
import { io } from "socket.io-client";

const Whiteboard = ({ roomId, userCount: initialUserCount, drawingData }) => {
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [userCount, setUserCount] = useState(initialUserCount || 1);
  const clearRef = useRef({});
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect directly to backend for Socket.io
    const socket = io("https://collaborative-whiteboard-fbx5.onrender.com");
    socketRef.current = socket;
    socket.emit("join-room", roomId);
    socket.on("user-count", setUserCount);
    // Clean up on unmount
    return () => {
      socket.emit("leave-room");
      socket.disconnect();
    };
  }, [roomId]);

  const handleClear = () => {
    if (clearRef.current.clearCanvas) {
      clearRef.current.clearCanvas();
    }
    if (socketRef.current) {
      socketRef.current.emit("clear-canvas");
    }
  };

  return (
    <div className="whiteboard-container">
      <Toolbar
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onClear={handleClear}
      />
      <DrawingCanvas
        roomId={roomId}
        drawingData={drawingData}
        color={color}
        strokeWidth={strokeWidth}
        onClear={clearRef.current}
        socket={socketRef.current}
      />
      <UserCursors userCount={userCount} socket={socketRef.current} />
    </div>
  );
};

export default Whiteboard;
