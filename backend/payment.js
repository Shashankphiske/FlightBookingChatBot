const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order
router.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency || 'INR',
      receipt: 'receipt_order_' + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err });
  }
});

module.exports = router;
