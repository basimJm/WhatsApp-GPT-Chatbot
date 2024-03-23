const botModel = require("../model/botMessageModel");

exports.saveMessageId = async function (messageId) {
  const newMessageId = new botModel({
    messageId: messageId,
  });
  await newMessageId.save();
};
