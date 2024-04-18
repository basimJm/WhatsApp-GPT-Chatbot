const phone = require("../model/phoneModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);

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

// get all cutomers in strip dashboard
exports.getAllCustomers = asyncHandler(async () => {
  const customers = await stripe.customers.list();
  let user;
  for (const data of customers.data) {
    if (data.phone !== null) {
      const phonNum = data.phone.replace("+", "");
      console.log(phonNum);
      user = await phone.findOne({ phoneNum: phonNum });
    }
  }
  if (!user) {
    return next(new ApiError("user not found"), 404);
  } else {
    console.log(`user phone is ${user.phoneNum}`);
    await phone.findOneAndUpdate(
      { phoneNum: customers.data.phone },
      { isSubscriber: true }
    );
  }
});
