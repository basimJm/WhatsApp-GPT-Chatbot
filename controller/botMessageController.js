const botModel = require("../model/botMessageModel");

exports.saveMessageId = async function (messageId, receiverId) {
  const newMessageId = new botModel({
    messageId: messageId,
    receiverId: receiverId,
  });
  await newMessageId.save();
};
