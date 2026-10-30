const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/categories - List categories with book counts
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        c.*,
        COUNT(b.id) AS book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories - Add category
router.post('/', (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const stmt = db.prepare(`
      INSERT INTO categories (name, description, color)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name.trim(), description || null, color || '#3b82f6');
    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Category with this name already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

