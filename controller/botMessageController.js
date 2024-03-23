const botModel = require("../model/botMessageModel");

exports.saveMessageId = async function (messageId, receiverId) {
  const newMessageId = new botModel({
    messageId: messageId,
    receiverId: receiverId,
  });
  await newMessageId.save();
};

exports.updateStatus = async function (messageId, newStatus) {
  const botMessage = await botModel.findOneAndUpdate(
    { messageId: messageId },
    { status: newStatus }
  );
};
