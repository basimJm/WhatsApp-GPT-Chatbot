const axios = require("axios");
const cron = require("node-cron");
const token = process.env.TOKEN;

const messageModel = require("../model/botMessageModel");

const { getAllPhoneNumbers, findNumberId } = require("./phoneController");
const {
  saveMessageId,
  getAllDailyMessages,
} = require("./botMessageController");

exports.schedualeReminderMessage = async function () {
  const messages = await getAllDailyMessages();

  messages.forEach(async (it) => {
    if (it.status === "delivered" || it.status === "sent") {
      const number = await findNumberId(it.receiverId);
      console.log(
        `number is ${number.phoneNum} and id is ${number.phoneNumId}`
      );
      cron.schedule("*/1 * * * *", () => {
        snedReminderMessage(number.phoneNumId, number.phoneNum);
      });
    }
  });
};
function snedReminderMessage(phoneNumId, phoneNum) {
  axios({
    method: "POST",
    url:
      `https://graph.facebook.com/v13.0/${phoneNumId}/messages?access_token=` +
      token,
    data: {
      messaging_product: "whatsapp",
      to: `${phoneNum}`,
      text: {
        body: "Reminder!! : please send your update as soon as possible",
      },
    },
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    console.log(`response is ${JSON.stringify(response.data, null, 2)}`);
  });
}

exports.schedualeDailyUpdateMessage = async function () {
  let serverTimeZone = "Asia/Amman";
  cron.schedule(
    "58 02 * * *",
    () => {
      const studentsId = getAllPhoneNumbers();

      studentsId.then((students) => {
        students.forEach((studendId) => {
          sendDailyUpdateMessage(studendId.phoneNumId, studendId.phoneNum);
        });
      });

      console.log("This message logs every two seconds");
    },
    {
      scheduled: true,
      timezone: serverTimeZone,
    }
  );
};
function sendDailyUpdateMessage(phoneNumId, phoneNum) {
  axios({
    method: "POST",
    url:
      `https://graph.facebook.com/v13.0/${phoneNumId}/messages?access_token=` +
      token,
    data: {
      messaging_product: "whatsapp",
      to: `${phoneNum}`,
      text: {
        body: "Hi Please send your update",
      },
    },
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    console.log(`response is ${JSON.stringify(response.data, null, 2)}`);
    const messageId = response.data.messages[0].id;
    const receiverId = response.data.contacts[0].wa_id;
    saveMessageId(messageId, receiverId);
  });
}
