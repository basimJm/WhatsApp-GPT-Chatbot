const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phoneNum: {
    type: String,
    unique: true,
  },
  phoneNumId: {
    type: String,
  },
  requestNum: {
    type: Number,
    default: 0,
  },
  isSubscriber: {
    type: Boolean,
    default: false,
  },
  chatHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatHistory",
    },
  ],
});

const userModel = mongoose.model("UserNumber", userSchema);

module.exports = userModel;
