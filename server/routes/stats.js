const express = require('express');
const router = express.Router();
const { db, refreshOverdueLoans } = require('../db');

// GET /api/stats - Dashboard summary metrics
router.get('/', (req, res) => {
  try {
    refreshOverdueLoans();

    const totalBooks = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(total_copies), 0) as copies, COALESCE(SUM(available_copies), 0) as available FROM books').get();
    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
    const activeMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'ACTIVE'").get().count;
    const activeLoans = db.prepare("SELECT COUNT(*) as count FROM book_loans WHERE status = 'BORROWED'").get().count;
    const overdueLoans = db.prepare("SELECT COUNT(*) as count FROM book_loans WHERE status = 'OVERDUE'").get().count;
    const returnedLoans = db.prepare("SELECT COUNT(*) as count FROM book_loans WHERE status = 'RETURNED'").get().count;
    const fines = db.prepare(`
      SELECT 
        COALESCE(SUM(fine_amount), 0) as total_fines,
        COALESCE(SUM(CASE WHEN fine_paid = 1 THEN fine_amount ELSE 0 END), 0) as collected_fines,
        COALESCE(SUM(CASE WHEN fine_paid = 0 THEN fine_amount ELSE 0 END), 0) as pending_fines
      FROM book_loans
    `).get();

    // Most popular books
    const popularBooks = db.prepare(`
      SELECT b.id, b.title, b.cover_url, a.name as author_name, COUNT(bl.id) as borrow_count
      FROM books b
      JOIN authors a ON b.author_id = a.id
      LEFT JOIN book_loans bl ON b.id = bl.book_id
      GROUP BY b.id
      ORDER BY borrow_count DESC
      LIMIT 5
    `).all();

    // Category breakdown
    const categoryBreakdown = db.prepare(`
      SELECT c.name, c.color, COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY book_count DESC
    `).all();

    res.json({
      totalTitles: totalBooks.count,
      totalCopies: totalBooks.copies,
      availableCopies: totalBooks.available,
      borrowedCopies: totalBooks.copies - totalBooks.available,
      totalMembers,
      activeMembers,
      activeLoans,
      overdueLoans,
      returnedLoans,
      totalLoans: activeLoans + overdueLoans + returnedLoans,
      fines,
      popularBooks,
      categoryBreakdown
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

