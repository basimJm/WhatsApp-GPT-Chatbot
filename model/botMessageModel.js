const mongoose = require("mongoose");

const botSchema = new mongoose.Schema({
  messageId: {
    type: String,
  },
});

const botModel = mongoose.model("BotMessage", botSchema);

module.exports = botModel;
