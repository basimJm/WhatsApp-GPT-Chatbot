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
  const messages = getAllDailyMessages();
  messages.then((message) => {
    message.forEach((it) => {
      if (it.status === "delivered" || it.status === "sent") {
        findNumberId(it.receiverId).then((number) => {
          console.log(
            `number is ${number.phoneNum} and id is ${number.phoneNumId}`
          );
          cron.schedule("*/1 * * * *", () => {
            checkMessageStatus(it._id, number);
          });
        });
      }
    });
  });
};
function snedReminderMessage(number) {
  axios({
    method: "POST",
    url:
      `https://graph.facebook.com/v13.0/${number.phoneNumId}/messages?access_token=` +
      token,
    data: {
      messaging_product: "whatsapp",
      to: `${number.phoneNum}`,
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

function getMessageStatus(messageId) {
  return new Promise((resolve, reject) => {
    messageModel.findByone(messageId, (err, message) => {
      if (err) {
        reject(err);
      } else {
        resolve(message.status);
      }
    });
  });
}

function checkMessageStatus(messageId, number) {
  getMessageStatus(messageId).then((status) => {
    if (status === "read") {
      console.log("Message has been read, no reminder needed.");
    } else {
      console.log("Sending reminder message...");
      snedReminderMessage(number);
    }
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
