// routes/payments.js
const express  = require('express');
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const db       = require('../models/db');
const { authMiddleware } = require('./auth');
const router   = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_YOUR_KEY_HERE',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_HERE',
});

// ── CREATE ORDER ──────────────────────────────────────────────
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise
    if (!amount || amount < 100) return res.status(400).json({ message: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: req.user.userId }
    });
    res.json(order);
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// ── VERIFY PAYMENT ────────────────────────────────────────────
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_HERE')
      .update(body).digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Update order status in DB
    await db.query(
      'UPDATE orders SET status = ?, payment_id = ? WHERE id = ?',
      ['paid', razorpay_payment_id, orderId]
    );
    res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// ── FETCH PAYMENT ─────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.id);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
});

// ── PAYMENT DOWNTIMES ─────────────────────────────────────────
router.get('/downtimes', async (req, res) => {
  try {
    const downtimes = await razorpay.payments.fetchPaymentDowntime();
    res.json(downtimes);
  } catch (err) {
    // Return empty if unavailable
    res.json({ items: [] });
  }
});

// ── WEBHOOK ───────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig  = req.headers['x-razorpay-signature'];
    const body = req.body.toString();
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret')
      .update(body).digest('hex');

    if (sig !== expected) { return res.status(400).json({ error: 'Invalid signature' }); }

    const event = JSON.parse(body);
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      await db.query(
        'UPDATE orders SET status = "paid", payment_id = ? WHERE razorpay_order_id = ?',
        [payment.id, payment.order_id]
      );
    }
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
