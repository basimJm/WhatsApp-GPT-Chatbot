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
app.use(express.json());
app.listen(process.env.PORT || 5000, () => {
  console.log("webhook is listening");
});

app.use("/webhook", webhookRoute);

// get all cutomers in strip dashboard
// (async () => {
//   const customers = await stripe.customers.list();
//   console.log(customers.data);
// })();

// get spepcific cutomers in strip dashboard
// (async () => {
//   const customers = await stripe.customers.retrieve("cus_PnzKlN5Mkg484A", {
//     // you can add stripe account this admin account in stripe so you can get customer with connected account
//     stripeAccount: "acct_1OyMbA1D08DtjSM8",
//   });
//   console.log(customers);
// })();

/**


//create user with nested parameter
// (async () => {
//   try {
//     const customers = await stripe.customers.create({
//       email: "khakel@test.com",
//       name: "jamal",
//       payment_method: "pm_1Oyhd71D08DtjSM8z0pz54un",
//       invoice_settings: {
//         default_payment_method: "pm_1Oyhd71D08DtjSM8z0pz54un",
//       },
//     });
//     console.log(customers);
//   } catch (err) {
//     console.log(err);
//   }
// })();


 * create payment method for customer
 * pass real  visa card number
 * you must use public key not secret
 * pass payment method id to create customer.payment_method
 */
// (async () => {
//   try {
//     const paymentMethod = await stripe.paymentMethods.create({
//       type: "card",
//       card: {
//         number: "4242424242424242", // Test card number, do NOT use real card details
//         exp_month: 12,
//         exp_year: 2024,
//         cvc: "699",
//       },
//     });
//     console.log(paymentMethod);
//   } catch (error) {
//     console.error(error);
//   }
// })();

/* attach payment method with customer
 * pass visa card id from create payment method id
 * you must use secret key not secret
 */

// (async () => {
//   try {
//     const paymentMethod = await stripe.paymentMethods.attach(
//       "pm_1OyhxX1D08DtjSM8dwRbmlx0",
//       {
//         customer: "cus_PnyoH8dZftfpRV",
//       }
//     );
//     console.log(paymentMethod);
//   } catch (err) {
//     console.log(err);
//   }
// })();

/**
 * here we realy pay  so user select amount and currency
 * then its return payment id that we saved to pass it in payment confirm
 */
// (async () => {
//   try {
//     const intnet = await stripe.paymentIntents.create({
//       amount: 5486,
//       currency: "usd",
//     });
//     console.log(intnet.id);
//     console.log(intnet.status);
//   } catch (err) {
//     console.log(err);
//   }
// })();

// (async () => {
//   try {
//     const paymentIntent = await stripe.paymentIntents.confirm(
//       "pi_3OyiVn1D08DtjSM81K7wqYc7",
//       {
//         payment_method: "pm_card_visa",
//         return_url: "https://www.example.com",
//       }
//     );
//     console.log(paymentIntent.id);
//     console.log(paymentIntent.status);
//   } catch (err) {
//     console.log(err);
//   }
// })();

// app.post("/confirm-payment", async (req, res) => {
//   const { paymentIntentId, paymentMethodId, returnUrl } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
//       payment_method: paymentMethodId,
//       return_url: returnUrl,
//     });

//     // If the operation was successful, send back the paymentIntent details
//     res.json({
//       paymentIntentId: paymentIntent.id,
//       status: paymentIntent.status,
//     });
//   } catch (err) {
//     // In case of an error, send back a descriptive message
//     res.status(500).json({ error: err.message });
//   }
// });
app.post(
  "/payment-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const event = JSON.parse(req.body);
    console.log(event.type);
  }
);
schedualeDailyUpdateMessage();
scheduleReminderMessage();
