const express = require("express");
const bodyParser = require("body-parser");
const dbConnection = require("./dbConnection");

const {
  schedualeReminderMessage,
  schedualeDailyUpdateMessage,
} = require("./controller/dailyUpdateController");
const webhookRoute = require("./route/webhookRoute");

const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const app = express().use(bodyParser.json());

dbConnection();

app.listen(process.env.PORT || 5000, () => {
  console.log("webhook is listening");
});

app.use("/webhook", webhookRoute);

schedualeDailyUpdateMessage();
schedualeReminderMessage();
