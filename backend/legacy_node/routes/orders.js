// routes/orders.js
const express = require('express');
const db      = require('../models/db');
const { authMiddleware } = require('./auth');
const router  = express.Router();

// ── CREATE ORDER ──────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, total, mode, razorpayOrderId } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items in order' });

    // Generate order number
    const [[{ maxId }]] = await db.query('SELECT MAX(order_number) as maxId FROM orders');
    const orderNumber = (maxId || 1000) + 1;

    const [result] = await db.query(
      'INSERT INTO orders (user_id, order_number, total, mode, status, razorpay_order_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, orderNumber, total, mode, 'pending', razorpayOrderId || null]
    );
    const orderId = result.insertId;

    // Insert order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.price, item.qty]
      );
    }

    res.status(201).json({ success: true, orderId, orderNumber: `#${orderNumber}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// ── GET USER ORDERS ───────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.userId]
    );
    for (const order of orders) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ── GET ORDER BY NUMBER (guest access) ───────────────────────
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const num = req.params.orderNumber.replace('#', '');
    const [[order]] = await db.query('SELECT * FROM orders WHERE order_number = ?', [num]);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to track order' });
  }
});

module.exports = router;
