const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/razorpay.controllers");
const router = express.Router();

router.post("/create", createOrder);
router.post("/verify-payment", verifyPayment);

module.exports = router;


