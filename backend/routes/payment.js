const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const dotenv=require('dotenv');
dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  const payment = await razorpay.orders.create({
    amount: amount * 100, // amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });
  res.json(payment);
});

module.exports = router;
