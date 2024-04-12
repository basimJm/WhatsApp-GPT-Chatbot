const express = require("express");
const bodyParser = require("body-parser");
const dbConnection = require("./dbConnection");
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const globalError = require("./middleware/errorMiddleware");

const {
  scheduleReminderMessage,
  schedualeDailyUpdateMessage,
} = require("./controller/dailyUpdateController");
const webhookRoute = require("./route/webhookRoute");

const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 5648;

const app = express();
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

app.use(bodyParser.json());
app.use(express.json());

app.use("/webhook", webhookRoute);

schedualeDailyUpdateMessage();
scheduleReminderMessage();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

app.listen(PORT, () => {
  console.log(`server run at PORT : ${PORT}`);
});

//Global error handiling middleware for express
app.use(globalError);

//Events => Listener => callback(err) when show any error out of express make event we just want to make listener for this error and send it with call back to catch it
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  if (server) {
    server.close(() => {
      console.error(
        "Server is shutting down due to an unhandled promise rejection."
      );
      process.exit(1);
    });
  } else {
    console.error("Server shutdown failed: server instance not available.");
    process.exit(1);
  }
});
