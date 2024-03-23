const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dbConnection = require("./dbConnection");
const cron = require("node-cron");

const {
  saveNumber,
  getAllPhoneNumbers,
  findNumberId,
} = require("./controller/phoneController");
const {
  saveMessageId,
  updateStatus,
  getAllDailyMessages,
} = require("./controller/botMessageController");
const dotenv = require("dotenv");
const { mongo } = require("mongoose");
dotenv.config({ path: "config.env" });

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
const currentDate = new Date();

const app = express().use(bodyParser.json());
dbConnection();

app.listen(process.env.PORT || 5000, () => {
  console.log("webhook is listening");
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body_param = req.body;

  const hasStatuses = body_param.entry.some((entry) =>
    entry.changes.some((change) => change.value.hasOwnProperty("statuses"))
  );

  if (hasStatuses) {
    console.log("The body contains statuses");
    body_param.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        change.value.statuses.forEach((status) => {
          if (status.status !== "status") {
            updateStatus(status.id, status.status);
          }
        });
      });
    });
  }

  console.log(JSON.stringify(body_param, null, 2));

  if (body_param.object) {
    console.log("inside body param");
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phon_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

      console.log("phone number " + phon_no_id);
      console.log("from " + from);
      console.log("boady param " + msg_body);

      saveNumber(from, phon_no_id);
      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v13.0/" +
          phon_no_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body:
              "Hi.. I'm Basim, AI will asnwer to you message " +
              msg_body +
              "As Soon As possible",
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.get("/", (req, res) => {
  res.status(200).send("hello this is webhook setup");
});

getAllPhoneNumbers().then((number) => {
  number.forEach((number) => {
    console.log(number.phoneNum);
  });
});

let serverTimeZone = "Asia/Amman";
cron.schedule(
  "04 01 * * *",
  () => {
    const testFrom = "962786135059";
    const studentsId = getAllPhoneNumbers();

    studentsId.then((students) => {
      students.forEach((studendId) => {
        axios({
          method: "POST",
          url:
            `https://graph.facebook.com/v13.0/${studendId.phoneNumId}/messages?access_token=` +
            token,
          data: {
            messaging_product: "whatsapp",
            to: `${studendId.phoneNum}`,
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
      });
    });

    console.log("This message logs every two seconds");
  },
  {
    scheduled: true,
    timezone: serverTimeZone,
  }
);

const messages = getAllDailyMessages();
messages.then((message) => {
  message.forEach((it) => {
    if (it.status === "delivered") {
      findNumberId(it.receiverId).then((number) => {
        console.log(
          `number is ${number.phoneNum} and id is ${number.phoneNumId}`
        );
        cron.schedule("*/2 * * * *", () => {
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
            console.log(
              `response is ${JSON.stringify(response.data, null, 2)}`
            );
            const messageId = response.data.messages[0].id;
            const receiverId = response.data.contacts[0].wa_id;
            saveMessageId(messageId, receiverId);
          });
        });
      });
    }
  });
});
