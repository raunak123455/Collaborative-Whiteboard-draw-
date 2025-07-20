import React, { useState } from "react";

const RoomJoin = ({ onJoin }) => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9]{6,8}$/.test(roomCode)) {
      setError("Room code must be 6-8 alphanumeric characters");
      return;
    }
    setError("");
    onJoin(roomCode);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: 32,
          minWidth: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: 24, color: "#222", fontWeight: 700 }}>
          Join a Whiteboard Room
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code"
            maxLength={8}
            minLength={6}
            required
            style={{
              fontSize: 20,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              outline: "none",
              marginBottom: 4,
            }}
          />
          <button
            type="submit"
            style={{
              fontSize: 18,
              padding: "12px 0",
              borderRadius: 8,
              background: "#6366f1",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Join Room
          </button>
          {error && (
            <div
              style={{ color: "#ef4444", fontWeight: 500, textAlign: "center" }}
            >
              {error}
            </div>
          )}
        </form>
        <div style={{ marginTop: 16, color: "#64748b", fontSize: 15 }}>
          Room code must be 6-8 letters or numbers.
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;
