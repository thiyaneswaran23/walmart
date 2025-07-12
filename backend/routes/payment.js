const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
const crypto = require('crypto');
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

router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    userName,
    userEmail,
    userAddress,
    cartItems,
    subtotal,
    discount,
    total
  } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  const isValid = generatedSignature === razorpay_signature;

  if (!isValid) {
    return res.status(400).json({ error: "Invalid signature, payment not verified" });
  }

  try {
    // Get payment details from Razorpay (including receipt URL)
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Optionally save to DB

    res.json({ receiptUrl: payment.receipt || `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}` });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({ error: "Failed to verify and fetch receipt" });
  }
});
module.exports = router;
