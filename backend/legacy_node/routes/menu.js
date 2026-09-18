// routes/menu.js
const express = require('express');
const db      = require('../models/db');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const { cat, subcat, search } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    if (cat)    { query += ' AND category = ?';    params.push(cat); }
    if (subcat) { query += ' AND subcategory = ?'; params.push(subcat); }
    if (search) { query += ' AND name LIKE ?';     params.push(`%${search}%`); }
    query += ' ORDER BY is_bestseller DESC, name ASC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch menu' });
  }
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Item not found' });
  res.json({ success: true, data: rows[0] });
});

module.exports = router;

// ─────────────────────────────────────────────────────────────
// routes/orders.js (inlined below — separate file in project)
