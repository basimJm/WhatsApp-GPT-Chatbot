const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
app.use(bodyParser.json());
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 5648;

const myToken = process.env.MYTOKEN;
const token = process.env.TOKEN;

app.listen(PORT, () => {
  console.log(`running on port : ${PORT}`);
});

app.get("/webhocks", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === myToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  } else {
    res.status(500).send("no data passed");
  }
});

app.post("/webhocks", (req, res) => {
  const body = req.body;
  if (body.object) {
    console.log("insid object body");
    if (
      body.object.entry &&
      body.object.entry[0].changes &&
      body.object.entry[0].changes[0].value.messages &&
      body.object.entry[0].changes[0].value.messages[0]
    ) {
      let phoneNumId =
        body.entry[0].challenge[0].value.metadata.phone_number_id;
      let from = body.entry[0].changes[0].value.messages[0].from;
      let msgBody = body.entry[0].changes[0].value.messages[0].text.body;
      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v18.0" / +phoneNumId +
          "message?access_token" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "hey how i can help you",
          },
          headers: {
            "Content-Type": "application/json",
          },
        },
      });
    } else {
      res.send("no data");
    }
  } else {
    res.send("no object");
  }
});
