const express = require('express');
const router = express.Router();
const { db, refreshOverdueLoans } = require('../db');

// GET /api/loans - List loans with joined book and member details
router.get('/', (req, res) => {
  try {
    refreshOverdueLoans();
    const { status, q, member_id, book_id } = req.query;

    let sql = `
      SELECT 
        bl.*,
        b.title AS book_title,
        b.isbn AS book_isbn,
        b.cover_url AS book_cover_url,
        b.shelf_location AS book_shelf,
        a.name AS author_name,
        c.name AS category_name,
        c.color AS category_color,
        m.card_number AS member_card_number,
        m.full_name AS member_name,
        m.email AS member_email,
        m.phone AS member_phone,
        CAST((julianday('now') - julianday(bl.due_date)) AS INTEGER) AS days_overdue
      FROM book_loans bl
      JOIN books b ON bl.book_id = b.id
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      JOIN members m ON bl.member_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ` AND bl.status = ?`;
      params.push(status);
    }

    if (member_id) {
      sql += ` AND bl.member_id = ?`;
      params.push(member_id);
    }

    if (book_id) {
      sql += ` AND bl.book_id = ?`;
      params.push(book_id);
    }

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      sql += ` AND (b.title LIKE ? OR m.full_name LIKE ? OR m.card_number LIKE ? OR b.isbn LIKE ?)`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY CASE bl.status WHEN 'OVERDUE' THEN 1 WHEN 'BORROWED' THEN 2 ELSE 3 END, bl.due_date ASC`;

    const loans = db.prepare(sql).all(...params);
    res.json(loans);
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/loans/overdue - Get only overdue loans with urgency metrics
router.get('/overdue', (req, res) => {
  try {
    refreshOverdueLoans();
    const sql = `
      SELECT 
        bl.*,
        b.title AS book_title,
        b.isbn AS book_isbn,
        b.cover_url AS book_cover_url,
        b.shelf_location AS book_shelf,
        a.name AS author_name,
        c.name AS category_name,
        m.card_number AS member_card_number,
        m.full_name AS member_name,
        m.email AS member_email,
        m.phone AS member_phone,
        CAST((julianday('now') - julianday(bl.due_date)) AS INTEGER) AS days_overdue
      FROM book_loans bl
      JOIN books b ON bl.book_id = b.id
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      JOIN members m ON bl.member_id = m.id
      WHERE bl.status = 'OVERDUE'
      ORDER BY bl.due_date ASC
    `;
    const overdueLoans = db.prepare(sql).all();
    res.json(overdueLoans);
  } catch (err) {
    console.error('Error fetching overdue loans:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/issue - Issue a book to a member (ACID Transaction)
router.post('/issue', (req, res) => {
  try {
    const { book_id, member_id, loan_duration_days = 14, notes } = req.body;

    if (!book_id || !member_id) {
      return res.status(400).json({ error: 'Both book_id and member_id are required' });
    }

    // 1. Check member status and limit
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(member_id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Member account is ${member.status}. Only ACTIVE members can borrow books.` });
    }

    const currentLoansCount = db.prepare(`
      SELECT COUNT(*) as count FROM book_loans 
      WHERE member_id = ? AND status IN ('BORROWED', 'OVERDUE')
    `).get(member_id).count;

    if (currentLoansCount >= member.max_borrow_limit) {
      return res.status(400).json({
        error: `Member has reached their maximum borrowing limit of ${member.max_borrow_limit} books.`
      });
    }

    // Check if member already has this active book
    const alreadyBorrowed = db.prepare(`
      SELECT id FROM book_loans 
      WHERE member_id = ? AND book_id = ? AND status IN ('BORROWED', 'OVERDUE')
    `).get(member_id, book_id);

    if (alreadyBorrowed) {
      return res.status(400).json({
        error: 'Member currently has an active copy of this book on loan.'
      });
    }

    // 2. Check book availability
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({
        error: `No copies of "${book.title}" are currently available. All ${book.total_copies} copies are checked out.`
      });
    }

    // 3. Perform Transaction: create loan & decrease available copies
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(loan_duration_days));

    const issueDateStr = issueDate.toISOString().split('T')[0];
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const issueTransaction = db.transaction(() => {
      const insertResult = db.prepare(`
        INSERT INTO book_loans (book_id, member_id, issue_date, due_date, status, fine_amount, fine_paid, notes)
        VALUES (?, ?, ?, ?, 'BORROWED', 0.00, 0, ?)
      `).run(book_id, member_id, issueDateStr, dueDateStr, notes || null);

      db.prepare(`
        UPDATE books 
        SET available_copies = available_copies - 1
        WHERE id = ?
      `).run(book_id);

      return insertResult.lastInsertRowid;
    });

    const newLoanId = issueTransaction();

    const createdLoan = db.prepare(`
      SELECT 
        bl.*,
        b.title AS book_title,
        b.isbn AS book_isbn,
        m.card_number AS member_card_number,
        m.full_name AS member_name
      FROM book_loans bl
      JOIN books b ON bl.book_id = b.id
      JOIN members m ON bl.member_id = m.id
      WHERE bl.id = ?
    `).get(newLoanId);

    res.status(201).json({
      message: `Book "${book.title}" successfully issued to ${member.full_name}!`,
      loan: createdLoan
    });
  } catch (err) {
    console.error('Error issuing book:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/:id/return - Return a book (ACID Transaction)
router.post('/:id/return', (req, res) => {
  try {
    const loan = db.prepare('SELECT * FROM book_loans WHERE id = ?').get(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan record not found' });
    }

    if (loan.status === 'RETURNED') {
      return res.status(400).json({ error: 'This book has already been returned.' });
    }

    const returnDateStr = new Date().toISOString().split('T')[0];

    // Compute fine if overdue: $0.75 per day past due_date
    const returnTx = db.transaction(() => {
      // Calculate days difference
      const daysDiff = db.prepare(`
        SELECT CAST(julianday(?) - julianday(?) AS INTEGER) AS diff
      `).get(returnDateStr, loan.due_date).diff;

      let fine = 0.00;
      if (daysDiff > 0) {
        fine = Number((daysDiff * 0.75).toFixed(2));
      }

      db.prepare(`
        UPDATE book_loans
        SET return_date = ?,
            status = 'RETURNED',
            fine_amount = ?
        WHERE id = ?
      `).run(returnDateStr, fine, req.params.id);

      // Increment available copies back
      db.prepare(`
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = ?
      `).run(loan.book_id);

      return fine;
    });

    const calculatedFine = returnTx();

    const updatedLoan = db.prepare(`
      SELECT 
        bl.*,
        b.title AS book_title,
        m.full_name AS member_name
      FROM book_loans bl
      JOIN books b ON bl.book_id = b.id
      JOIN members m ON bl.member_id = m.id
      WHERE bl.id = ?
    `).get(req.params.id);

    res.json({
      message: `Book "${updatedLoan.book_title}" returned successfully!`,
      loan: updatedLoan,
      fine: calculatedFine
    });
  } catch (err) {
    console.error('Error returning book:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/:id/renew - Extend due date by 14 days
router.post('/:id/renew', (req, res) => {
  try {
    const loan = db.prepare('SELECT * FROM book_loans WHERE id = ?').get(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (loan.status === 'RETURNED') {
      return res.status(400).json({ error: 'Cannot renew an already returned loan.' });
    }

    // Extend due date by 14 days from current due date
    const updated = db.prepare(`
      UPDATE book_loans
      SET due_date = DATE(due_date, '+14 days'),
          status = 'BORROWED',
          fine_amount = 0.00
      WHERE id = ?
    `).run(req.params.id);

    const renewed = db.prepare('SELECT * FROM book_loans WHERE id = ?').get(req.params.id);
    res.json({ message: 'Loan renewed successfully for 14 more days!', loan: renewed });
  } catch (err) {
    console.error('Error renewing loan:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/:id/pay-fine - Mark fine as paid
router.post('/:id/pay-fine', (req, res) => {
  try {
    const loan = db.prepare('SELECT * FROM book_loans WHERE id = ?').get(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    db.prepare('UPDATE book_loans SET fine_paid = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Fine marked as paid successfully!' });
  } catch (err) {
    console.error('Error updating fine:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

