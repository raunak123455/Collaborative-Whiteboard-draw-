import { useState } from "react";
import RoomJoin from "./components/RoomJoin";
import Whiteboard from "./components/Whiteboard";
import "./App.css";

function App() {
  const [room, setRoom] = useState(null);
  const [userCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler for joining a room
  const handleJoin = async (code) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://collaborative-whiteboard-fbx5.onrender.com/api/rooms/join",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: code }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join room");
      setRoom(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {!room ? (
        <>
          <RoomJoin onJoin={handleJoin} />
          {loading && <div>Joining room...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
        </>
      ) : (
        <Whiteboard
          roomId={room.roomId}
          userCount={userCount}
          drawingData={room.drawingData}
        />
      )}
    </div>
  );
}

export default App;
