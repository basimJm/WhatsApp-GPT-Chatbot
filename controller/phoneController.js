const phone = require("../model/phoneModel");

exports.saveNumber = async function (number, phoneNumId) {
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
