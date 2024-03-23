const express = require("express");

const router = express.Router();

const {
  getWebhookMessage,
  postWeebhook,
} = require("../controller/webhookController");

router.route("/").get(getWebhookMessage).post(postWeebhook);

module.exports = router;
