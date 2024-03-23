const axios = require("axios");
const cron = require("node-cron");

const {
  saveNumber,
  getAllPhoneNumbers,
  findNumberId,
} = require("./phoneController");
const {
  saveMessageId,
  updateStatus,
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
          cron.schedule("*/2 * * * *", () => {
            snedReminderMessage(number);
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
  });
}

exports.schedualeDailyUpdateMessage = async function () {
  let serverTimeZone = "Asia/Amman";
  cron.schedule(
    "32 02 * * *",
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
