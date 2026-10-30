const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/authors - List authors with book counts
router.get('/', (req, res) => {
  try {
    const authors = db.prepare(`
      SELECT 
        a.*,
        COUNT(b.id) AS book_count
      FROM authors a
      LEFT JOIN books b ON a.id = b.author_id
      GROUP BY a.id
      ORDER BY a.name ASC
    `).all();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/authors - Add author
router.post('/', (req, res) => {
  try {
    const { name, bio, born_year, nationality } = req.body;
    if (!name) return res.status(400).json({ error: 'Author name is required' });

    const stmt = db.prepare(`
      INSERT INTO authors (name, bio, born_year, nationality)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name.trim(), bio || null, born_year ? parseInt(born_year) : null, nationality || null);
    const created = db.prepare('SELECT * FROM authors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

