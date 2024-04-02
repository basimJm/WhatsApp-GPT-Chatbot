const phone = require("../model/phoneModel");
const asyncHandler = require("express-async-handler");
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

exports.addNumberForTest = asyncHandler(async (req, res, next) => {
  const { phoneNum, phoneNumId } = req.body;
  if (!phoneNum || !phoneNumId) {
    return next(new ApiError("invalid body"), 500);
  }
  const isNumberUsed = await phone.findOne({ phoneNum: phoneNum });
  if (isNumberUsed) {
    return next(new ApiError("number is already saved "), 403);
  }
  const newNumber = new phone({
    phoneNum: phoneNum,
    phoneNumId: phoneNumId,
  });
  await newNumber.save();
  res.status(201).json({
    status: "success",
    message: "number saved successfully",
    data: newNumber,
  });
});
