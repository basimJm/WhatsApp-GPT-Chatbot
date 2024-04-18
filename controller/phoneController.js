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
exports.findAndUpdateUserSubscription = asyncHandler(
  async (req, res, next, webhookNumber) => {
    const customers = await stripe.customers.list();
    const user = await phone.findOne({ phoneNum: webhookNumber });
    if (!user || !customers) {
      await updateUserSubscription(user, webhookNumber, false);
      return next(new ApiError("user not found"), 404);
    } else {
      for (const data of customers.data) {
        const phonNum = data.phone.replace("+", "");
        if (phonNum === webhookNumber) {
          await updateUserSubscription(user, phonNum, true);
        } else {
          await updateUserSubscription(user, phonNum, false);
        }
      }
    }
  }
);

async function updateUserSubscription(user, phonNum, falg) {
  console.log(`user phone is ${user.phoneNum}`);
  await phone.findOneAndUpdate(
    { phoneNum: phonNum },
    { $set: { isSubscriber: falg } },
    { new: true }
  );
}
