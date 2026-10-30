const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/members - List members with active loan counts
router.get('/', (req, res) => {
  try {
    const { q, status } = req.query;
    let sql = `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM book_loans bl WHERE bl.member_id = m.id AND bl.status IN ('BORROWED', 'OVERDUE')) AS active_loans_count,
        (SELECT COUNT(*) FROM book_loans bl WHERE bl.member_id = m.id AND bl.status = 'OVERDUE') AS overdue_loans_count,
        (SELECT COALESCE(SUM(bl.fine_amount), 0) FROM book_loans bl WHERE bl.member_id = m.id AND bl.fine_paid = 0) AS unpaid_fines
      FROM members m
      WHERE 1=1
    `;
    const params = [];

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      sql += ` AND (m.full_name LIKE ? OR m.email LIKE ? OR m.card_number LIKE ? OR m.phone LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (status) {
      sql += ` AND m.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY m.joined_date DESC, m.id DESC`;

    const members = db.prepare(sql).all(...params);
    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/members/:id - Member profile and full loan history
router.get('/:id', (req, res) => {
  try {
    const member = db.prepare(`
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM book_loans bl WHERE bl.member_id = m.id AND bl.status IN ('BORROWED', 'OVERDUE')) AS active_loans_count,
        (SELECT COUNT(*) FROM book_loans bl WHERE bl.member_id = m.id AND bl.status = 'OVERDUE') AS overdue_loans_count,
        (SELECT COALESCE(SUM(bl.fine_amount), 0) FROM book_loans bl WHERE bl.member_id = m.id AND bl.fine_paid = 0) AS unpaid_fines
      FROM members m
      WHERE m.id = ?
    `).get(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Loans with book information
    const loans = db.prepare(`
      SELECT 
        bl.*,
        b.title AS book_title,
        b.isbn AS book_isbn,
        b.cover_url AS book_cover_url,
        a.name AS author_name,
        c.name AS category_name,
        c.color AS category_color
      FROM book_loans bl
      JOIN books b ON bl.book_id = b.id
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      WHERE bl.member_id = ?
      ORDER BY bl.issue_date DESC
    `).all(req.params.id);

    res.json({ ...member, loans });
  } catch (err) {
    console.error('Error fetching member:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/members - Register a new member
router.post('/', (req, res) => {
  try {
    const { full_name, email, phone, status, max_borrow_limit } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    // Generate unique card number if not provided
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const card_number = req.body.card_number || `LIB-${year}-${randomSuffix}`;

    const stmt = db.prepare(`
      INSERT INTO members (card_number, full_name, email, phone, status, max_borrow_limit)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      card_number.trim(),
      full_name.trim(),
      email.trim().toLowerCase(),
      phone ? phone.trim() : null,
      status || 'ACTIVE',
      parseInt(max_borrow_limit) || 5
    );

    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newMember);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: members.email')) {
      return res.status(400).json({ error: 'A member with this email address already exists.' });
    }
    if (err.message.includes('UNIQUE constraint failed: members.card_number')) {
      return res.status(400).json({ error: 'A member with this card number already exists.' });
    }
    console.error('Error registering member:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/members/:id - Update member profile
router.put('/:id', (req, res) => {
  try {
    const { full_name, email, phone, status, max_borrow_limit, card_number } = req.body;
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const stmt = db.prepare(`
      UPDATE members
      SET full_name = ?, email = ?, phone = ?, status = ?, max_borrow_limit = ?, card_number = ?
      WHERE id = ?
    `);

    stmt.run(
      full_name || member.full_name,
      email ? email.toLowerCase() : member.email,
      phone !== undefined ? phone : member.phone,
      status || member.status,
      max_borrow_limit !== undefined ? parseInt(max_borrow_limit) : member.max_borrow_limit,
      card_number || member.card_number,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', (req, res) => {
  try {
    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM book_loans 
      WHERE member_id = ? AND status IN ('BORROWED', 'OVERDUE')
    `).get(req.params.id).count;

    if (activeLoans > 0) {
      return res.status(400).json({
        error: 'Cannot delete member: The member has active unreturned books. All books must be returned first.'
      });
    }

    db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

