const mongoose = require("mongoose");

const dbConnection = () => {
  // Connecet with DB
  mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.log(`erorr to connect to mongodb because of error :${err}`);
    });
};

module.exports = dbConnection;
