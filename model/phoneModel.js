const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phoneNum: {
    type: String,
  },
});

const userModel = mongoose.model("Conversation", userSchema);

module.exports = userModel;
