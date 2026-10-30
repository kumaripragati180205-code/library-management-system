const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/books - List books with search & filters
router.get('/', (req, res) => {
  try {
    const { q, author_id, category_id, available_only } = req.query;
    let sql = `
      SELECT 
        b.id,
        b.title,
        b.isbn,
        b.publisher,
        b.published_year,
        b.total_copies,
        b.available_copies,
        b.shelf_location,
        b.cover_url,
        b.description,
        b.author_id,
        a.name AS author_name,
        a.nationality AS author_nationality,
        b.category_id,
        c.name AS category_name,
        c.color AS category_color,
        (SELECT COUNT(*) FROM book_loans bl WHERE bl.book_id = b.id AND bl.status IN ('BORROWED', 'OVERDUE')) AS current_borrowed_count
      FROM books b
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      sql += ` AND (b.title LIKE ? OR a.name LIKE ? OR b.isbn LIKE ? OR c.name LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (author_id) {
      sql += ` AND b.author_id = ?`;
      params.push(author_id);
    }

    if (category_id) {
      sql += ` AND b.category_id = ?`;
      params.push(category_id);
    }

    if (available_only === 'true') {
      sql += ` AND b.available_copies > 0`;
    }

    sql += ` ORDER BY b.title ASC`;

    const books = db.prepare(sql).all(...params);
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/books/:id - Get single book details and loan history
router.get('/:id', (req, res) => {
  try {
    const book = db.prepare(`
      SELECT 
        b.*,
        a.name AS author_name,
        a.bio AS author_bio,
        a.nationality AS author_nationality,
        c.name AS category_name,
        c.description AS category_description,
        c.color AS category_color
      FROM books b
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Related loans (showing the M:N relationship in action)
    const loans = db.prepare(`
      SELECT 
        bl.id,
        bl.issue_date,
        bl.due_date,
        bl.return_date,
        bl.status,
        bl.fine_amount,
        bl.fine_paid,
        m.id AS member_id,
        m.card_number,
        m.full_name AS member_name,
        m.email AS member_email
      FROM book_loans bl
      JOIN members m ON bl.member_id = m.id
      WHERE bl.book_id = ?
      ORDER BY bl.issue_date DESC
    `).all(req.params.id);

    res.json({ ...book, loans });
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/books - Add a new book
router.post('/', (req, res) => {
  try {
    const {
      title,
      isbn,
      author_id,
      category_id,
      publisher,
      published_year,
      total_copies,
      shelf_location,
      cover_url,
      description
    } = req.body;

    if (!title || !isbn || !author_id || !category_id) {
      return res.status(400).json({ error: 'Title, ISBN, author, and category are required' });
    }

    // Verify author & category exist
    const author = db.prepare('SELECT id FROM authors WHERE id = ?').get(author_id);
    if (!author) return res.status(400).json({ error: 'Invalid author_id: author does not exist' });

    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) return res.status(400).json({ error: 'Invalid category_id: category does not exist' });

    const copies = parseInt(total_copies) || 1;
    const defaultCover = cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop';

    const stmt = db.prepare(`
      INSERT INTO books (
        title, isbn, author_id, category_id, publisher, published_year,
        total_copies, available_copies, shelf_location, cover_url, description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      isbn.trim(),
      author_id,
      category_id,
      publisher ? publisher.trim() : null,
      published_year ? parseInt(published_year) : null,
      copies,
      copies,
      shelf_location ? shelf_location.trim() : 'General',
      defaultCover,
      description ? description.trim() : null
    );

    const newBook = db.prepare(`
      SELECT b.*, a.name AS author_name, c.name AS category_name, c.color AS category_color
      FROM books b
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newBook);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: books.isbn')) {
      return res.status(400).json({ error: 'A book with this ISBN already exists.' });
    }
    console.error('Error creating book:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/books/:id - Update book
router.put('/:id', (req, res) => {
  try {
    const {
      title,
      isbn,
      author_id,
      category_id,
      publisher,
      published_year,
      total_copies,
      shelf_location,
      cover_url,
      description
    } = req.body;

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const newTotal = parseInt(total_copies) || book.total_copies;
    const borrowedCount = book.total_copies - book.available_copies;

    if (newTotal < borrowedCount) {
      return res.status(400).json({
        error: `Cannot reduce total copies below currently borrowed count (${borrowedCount})`
      });
    }

    const newAvailable = newTotal - borrowedCount;

    const stmt = db.prepare(`
      UPDATE books
      SET title = ?, isbn = ?, author_id = ?, category_id = ?, publisher = ?,
          published_year = ?, total_copies = ?, available_copies = ?,
          shelf_location = ?, cover_url = ?, description = ?
      WHERE id = ?
    `);

    stmt.run(
      title || book.title,
      isbn || book.isbn,
      author_id || book.author_id,
      category_id || book.category_id,
      publisher !== undefined ? publisher : book.publisher,
      published_year !== undefined ? published_year : book.published_year,
      newTotal,
      newAvailable,
      shelf_location || book.shelf_location,
      cover_url || book.cover_url,
      description !== undefined ? description : book.description,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT b.*, a.name AS author_name, c.name AS category_name, c.color AS category_color
      FROM books b
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/books/:id - Delete book (check for active loans)
router.delete('/:id', (req, res) => {
  try {
    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM book_loans 
      WHERE book_id = ? AND status IN ('BORROWED', 'OVERDUE')
    `).get(req.params.id).count;

    if (activeLoans > 0) {
      return res.status(400).json({
        error: 'Cannot delete book: There are currently active loans for this book. Books must be returned first.'
      });
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

