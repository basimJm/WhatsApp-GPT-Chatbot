const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
const axios = require("axios");
const OpenAi = require("openai");
const userModel = require("../model/phoneModel");
const ChatHistoryModel = require("../model/chatHistorymodel");
const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

const { saveNumber } = require("./phoneController");
const { updateStatus } = require("./botMessageController");
const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

async function aiAnswer(msg_body, phoneNum, next) {
  const user = await userModel
    .findOne({ phoneNum: phoneNum })
    .populate("chatHistory");

  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  const chatHistoryMessages = await ChatHistoryModel.find({
    _id: { $in: user.chatHistory },
  });

  let dbAnswer = "";
  for (let storedMessage of chatHistoryMessages) {
    if (storedMessage.userMessage === msg_body) {
      console.log(`answer from DB : ${storedMessage.aiMessage}`);
      dbAnswer = storedMessage.aiMessage;
      break;
    }
  }

  if (dbAnswer !== "" || dbAnswer !== null) {
    return dbAnswer;
  }

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

  message.push({ role: "user", content: msg_body });

  const chatCompletion = await openai.chat.completions.create({
    messages: message,
    model: "gpt-3.5-turbo",
  });
  const aiMessage = chatCompletion.choices[0].message.content;

  const newChatHistory = {
    userMessage: msg_body,
    aiMessage: aiMessage,
  };

  const newChats = await ChatHistoryModel.create(newChatHistory);

  user.chatHistory.push(newChats);

  await user.save();

  return chatCompletion.choices[0].message.content;
}

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

  try {
    // Checking for message presence to process further
    if (body_param.object && body_param.entry) {
      for (const entry of body_param.entry) {
        for (const change of entry.changes) {
          if (change.field === "messages" && change.value.messages) {
            for (const message of change.value.messages) {
              const phoneNum = message.from;
              const msg_body = message.text.body;
              const phon_no_id =
                entry.changes[0].value.metadata.phone_number_id;

              console.log("Phone number ID: " + phon_no_id);
              console.log("From: " + phoneNum);
              console.log("Message body: " + msg_body);

              await saveNumber(phoneNum, phon_no_id, next);
              const aiMessage = await aiAnswer(msg_body, phoneNum, next);

              if (aiMessage) {
                await axios({
                  method: "POST",
                  url: `https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${process.env.TOKEN}`,
                  data: {
                    messaging_product: "whatsapp",
                    to: phoneNum,
                    text: {
                      body: aiMessage,
                    },
                  },
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                res.sendStatus(200);
                return;
              }
            }
          }
        }
      }
    }

    res.sendStatus(404);
    console.error("inside Error message empty:", error);
  } catch (error) {
    console.error("outside Error:", error);
    if (!res.headersSent) {
      res.sendStatus(500);
    }
  }
};
