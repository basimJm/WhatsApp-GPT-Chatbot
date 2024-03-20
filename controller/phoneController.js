const phone = require("../model/phoneModel");

async function savePhoneNum(number) {
  newNum = new phone({
    phoneNum: number,
  });
  await newNum.save();
}
module.exports = savePhoneNum();
