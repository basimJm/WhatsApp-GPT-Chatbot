const mongoose = require("mongoose");

const botSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
  },
  receiverId: {
    type: String,
  },
  status: {
    type: String,
    default: "sent",
  },
});

const botModel = mongoose.model("BotMessage", botSchema);

module.exports = botModel;
