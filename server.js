const express = require("express");
const bodyParser = require("body-parser");
const dbConnection = require("./dbConnection");
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);

const {
  scheduleReminderMessage,
  schedualeDailyUpdateMessage,
} = require("./controller/dailyUpdateController");
const webhookRoute = require("./route/webhookRoute");

const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const app = express().use(bodyParser.json());

dbConnection();

app.post(
  "/payment-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event = req.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    const endpointSecret = process.env.END_POIN_SECRET;
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );

        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }

    res.send();
  }
);

app.use(express.json());

app.listen(process.env.PORT || 5000, () => {
  console.log("webhook is listening");
});

app.use("/webhook", webhookRoute);

app.post("/confirm-payment", async (req, res) => {
  const { paymentIntentId, paymentMethodId, returnUrl } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: returnUrl,
    });

    // If the operation was successful, send back the paymentIntent details
    res.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (err) {
    // In case of an error, send back a descriptive message
    res.status(500).json({ error: err.message });
  }
});

schedualeDailyUpdateMessage();
scheduleReminderMessage();
