const phone = require("../model/phoneModel");
const ApiError = require("../utils/apiError");

exports.saveNumber = async function (number, phoneNumId, next) {
  const isNumberUsed = await phone.findOne({ phoneNum: number });
  if (isNumberUsed) {
    return next(new ApiError("number is already saved "), 403);
  }
  const newNumber = new phone({
    phoneNum: number,
    phoneNumId: phoneNumId,
  });
  await newNumber.save();
};

exports.getAllPhoneNumbers = async () => {
  const allNumbers = await phone.find({});
  return allNumbers;
};

exports.findNumberId = async function (phoneNum) {
  const mobile = await phone.findOne({ phoneNum: phoneNum });
  return mobile;
};
