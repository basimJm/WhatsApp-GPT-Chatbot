const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema({
  userMessage: {
    type: String,
  },
  aiMessage: {
    type: String,
  },
});

const userModel = mongoose.model("ChatHistory", chatHistorySchema);

module.exports = userModel;
