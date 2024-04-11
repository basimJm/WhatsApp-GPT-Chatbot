const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
const axios = require("axios");
const OpenAi = require("openai");
const userModel = require("../model/phoneModel");
const ChatHistoryModel = require("../model/chatHistorymodel");
const ApiError = require("../utils/apiError");

const { saveNumber } = require("./phoneController");
const { updateStatus } = require("./botMessageController");
const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

async function aiAnswer(question, phoneNum, next) {
  const user = await userModel
    .findOne({ phoneNum: phoneNum })
    .populate("chatHistory");

  if (!user) {
    next(new ApiError("user not found", 404));
    console.log("User not found");
  }
  const chatHistoryMessages = await ChatHistoryModel.find({
    _id: { $in: user.chatHistory },
  });

  if (!chatHistoryMessages) {
    next(new ApiError("Hisotry empty", 404));
  }

  // let retrunedMessage;
  // for (let aiMsg of chatHistoryMessages) {
  //   if (aiMsg.userMessage === question) {
  //     console.log(`answer from DB : ${aiMsg.aiMessage}`);
  //     retrunedMessage = aiMsg.aiMessage;
  //     break;
  //   }
  // }

  // if (retrunedMessage !== null || retrunedMessage!=="") {
  //   return retrunedMessage;
  // } else {
  const message = user.chatHistory.flatMap((msg) => [
    {
      role: "user",
      content: msg.userMessage,
    },
    {
      role: "assistant",
      content: msg.aiMessage,
    },
  ]);

  message.push({ role: "user", content: question });

  const chatCompletion = await openai.chat.completions.create({
    messages: message,
    model: "gpt-3.5-turbo",
  });
  const aiMessage = chatCompletion.choices[0].message.content;

  const newChatHistory = {
    userMessage: question,
    aiMessage: aiMessage,
  };

  const newChats = await ChatHistoryModel.create(newChatHistory);

  user.chatHistory.push(newChats);

  await user.save();

  return aiMessage;
}
// }

exports.getWebhookMessage = async (req, res) => {
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
};

exports.postWeebhook = async (req, res, next) => {
  let body_param = req.body;

  const hasStatuses = body_param.entry.some((entry) =>
    entry.changes.some((change) => change.value.hasOwnProperty("statuses"))
  );

  if (hasStatuses) {
    console.log("The body contains statuses");
    body_param.entry.forEach(async (entry) => {
      entry.changes.forEach(async (change) => {
        change.value.statuses.forEach(async (status) => {
          if (status.status !== "status") {
            await updateStatus(status.id, status.status);
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
      await saveNumber(from, phon_no_id, next);
      const aiMessage = await aiAnswer(msg_body, from);
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
            body: aiMessage,
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
};
