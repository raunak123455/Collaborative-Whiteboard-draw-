const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const Room = require("./models/Room");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://raunakrana101:raunak123@task.ipcmm.mongodb.net/?retryWrites=true&w=majority&appName=board",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Basic route
app.get("/", (req, res) => {
  res.send("Server is running");
});

const activeUsers = {};
const currentStrokes = {}; // { socketId: { points: [], color, strokeWidth } }

io.on("connection", (socket) => {
  let currentRoom = null;

  socket.on("join-room", async (roomId) => {
    if (!roomId || typeof roomId !== "string") return;
    socket.join(roomId);
    currentRoom = roomId;
    if (!activeUsers[roomId]) activeUsers[roomId] = new Set();
    activeUsers[roomId].add(socket.id);
    // Notify others
    io.to(roomId).emit("user-count", activeUsers[roomId].size);
    // Send existing drawing data
    const room = await Room.findOne({ roomId });
    if (room) {
      socket.emit("init-drawing-data", room.drawingData);
    }
  });

  socket.on("leave-room", () => {
    if (currentRoom && activeUsers[currentRoom]) {
      activeUsers[currentRoom].delete(socket.id);
      io.to(currentRoom).emit("user-count", activeUsers[currentRoom].size);
      socket.leave(currentRoom);
      currentRoom = null;
    }
    delete currentStrokes[socket.id];
  });

  socket.on("cursor-move", (data) => {
    if (currentRoom) {
      socket
        .to(currentRoom)
        .emit("cursor-move", { userId: socket.id, ...data });
    }
  });

  socket.on("draw-start", (data) => {
    if (currentRoom) {
      currentStrokes[socket.id] = {
        points: [data.pos],
        color: data.color,
        strokeWidth: data.strokeWidth,
      };
      socket.to(currentRoom).emit("draw-start", { userId: socket.id, ...data });
    }
  });

  socket.on("draw-move", (data) => {
    if (currentRoom) {
      if (currentStrokes[socket.id]) {
        currentStrokes[socket.id].points.push(data.to);
      }
      socket.to(currentRoom).emit("draw-move", { userId: socket.id, ...data });
    }
  });

  socket.on("draw-end", async () => {
    if (currentRoom && currentStrokes[socket.id]) {
      const stroke = currentStrokes[socket.id];
      try {
        await Room.updateOne(
          { roomId: currentRoom },
          {
            $push: {
              drawingData: {
                type: "stroke",
                data: stroke,
                timestamp: new Date(),
              },
            },
            $set: { lastActivity: new Date() },
          }
        );
      } catch (err) {
        /* handle error */
      }
      delete currentStrokes[socket.id];
      socket.to(currentRoom).emit("draw-end", { userId: socket.id });
    }
  });

  socket.on("clear-canvas", async () => {
    if (currentRoom) {
      io.to(currentRoom).emit("clear-canvas");
      // Persist clear command
      try {
        await Room.updateOne(
          { roomId: currentRoom },
          {
            $push: {
              drawingData: { type: "clear", data: {}, timestamp: new Date() },
            },
            $set: { lastActivity: new Date() },
          }
        );
      } catch (err) {
        /* handle error */
      }
    }
  });

  socket.on("disconnect", () => {
    if (currentRoom && activeUsers[currentRoom]) {
      activeUsers[currentRoom].delete(socket.id);
      io.to(currentRoom).emit("user-count", activeUsers[currentRoom].size);
      if (activeUsers[currentRoom].size === 0) {
        delete activeUsers[currentRoom];
      }
    }
    delete currentStrokes[socket.id];
  });
});

// Join or create a room
app.post("/api/rooms/join", async (req, res) => {
  const { roomId } = req.body;
  if (
    !roomId ||
    typeof roomId !== "string" ||
    !/^[a-zA-Z0-9]{6,8}$/.test(roomId)
  ) {
    return res.status(400).json({ error: "Invalid room code" });
  }
  try {
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = await Room.create({ roomId });
    }
    room.lastActivity = new Date();
    await room.save();
    res.json({ roomId: room.roomId, drawingData: room.drawingData });
  } catch (err) {
    console.error("/api/rooms/join error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get room info
app.get("/api/rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ roomId: room.roomId, drawingData: room.drawingData });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Cleanup job: remove rooms inactive for 24+ hours
setInterval(async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const result = await Room.deleteMany({ lastActivity: { $lt: cutoff } });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} inactive rooms.`);
    }
  } catch (err) {
    console.error("Error cleaning up rooms:", err);
  }
}, 60 * 60 * 1000); // Every hour

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
