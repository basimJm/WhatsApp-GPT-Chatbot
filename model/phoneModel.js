const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phoneNum: {
    type: String,
  },
  phoneNumId: {
    type: String,
  },
});

const userModel = mongoose.model("phone", userSchema);

module.exports = userModel;
