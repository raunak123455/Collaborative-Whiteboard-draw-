const mongoose = require("mongoose");

const DrawingCommandSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // 'stroke', 'clear'
    data: { type: Object, required: true }, // path data, color, width, etc.
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  drawingData: { type: [DrawingCommandSchema], default: [] },
});

module.exports = mongoose.model("Room", RoomSchema);
