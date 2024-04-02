const express = require("express");

const router = express.Router();

const { addNumberForTest } = require("../controller/phoneController");

router.route("/").post(addNumberForTest);

module.exports = router;
