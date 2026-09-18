// ============================================================
//  STARBUCKS INDIA — BACKEND SERVER (Node.js + Express)
// ============================================================
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const menuRoutes    = require('./routes/menu');
const orderRoutes   = require('./routes/orders');
const paymentRoutes = require('./routes/payments');

const app = express();

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));

// Razorpay webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/menu',     menuRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── ERROR HANDLER ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── START ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Starbucks API running on http://localhost:${PORT}`));
