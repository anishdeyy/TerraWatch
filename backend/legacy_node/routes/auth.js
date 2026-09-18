// routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../models/db');
const router  = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'starbucks_secret_2026';
const JWT_EXPIRY = '7d';

// ── REGISTER ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !email || !password) return res.status(400).json({ message: 'Required fields missing' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    // Check existing
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone || null, hash]
    );

    const user = { id: result.insertId, name: `${firstName} ${lastName}`, email };
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({
      success: true,
      token,
      user: { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ── AUTH MIDDLEWARE (export for other routes) ─────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.get('/me', authMiddleware, async (req, res) => {
  const [rows] = await db.query('SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?', [req.user.userId]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  const u = rows[0];
  res.json({ id: u.id, name: `${u.first_name} ${u.last_name}`, email: u.email, phone: u.phone });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
