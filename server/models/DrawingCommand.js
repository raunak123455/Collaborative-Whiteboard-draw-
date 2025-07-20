const mongoose = require("mongoose");

const DrawingCommandSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'stroke', 'clear'
  data: { type: Object, required: true }, // path data, color, width, etc.
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DrawingCommand", DrawingCommandSchema);
