const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Entity Relationship Diagram definitions & explanation
const ERD_METADATA = {
  entities: [
    {
      name: 'authors',
      displayName: 'Authors Entity',
      badge: 'Parent Entity',
      description: 'Stores biographical and reference data for authors.',
      columns: [
        { name: 'id', type: 'INTEGER', isPk: true, isFk: false, desc: 'Primary Key (Auto-increment)' },
        { name: 'name', type: 'TEXT', isPk: false, isFk: false, desc: 'Full author name (NOT NULL)' },
        { name: 'bio', type: 'TEXT', isPk: false, isFk: false, desc: 'Biography snippet' },
        { name: 'born_year', type: 'INTEGER', isPk: false, isFk: false, desc: 'Birth year' },
        { name: 'nationality', type: 'TEXT', isPk: false, isFk: false, desc: 'Country / Nationality' },
        { name: 'created_at', type: 'DATETIME', isPk: false, isFk: false, desc: 'Timestamp' }
      ]
    },
    {
      name: 'categories',
      displayName: 'Categories Entity',
      badge: 'Parent Entity',
      description: 'Taxonomy of genres & classifications for cataloging books.',
      columns: [
        { name: 'id', type: 'INTEGER', isPk: true, isFk: false, desc: 'Primary Key (Auto-increment)' },
        { name: 'name', type: 'TEXT', isPk: false, isFk: false, desc: 'Category name (UNIQUE, NOT NULL)' },
        { name: 'description', type: 'TEXT', isPk: false, isFk: false, desc: 'Category description' },
        { name: 'color', type: 'TEXT', isPk: false, isFk: false, desc: 'Hex UI badge color' }
      ]
    },
    {
      name: 'books',
      displayName: 'Books Entity',
      badge: 'Child & Parent Entity',
      description: 'Catalog of inventory items referencing Authors and Categories via Foreign Keys.',
      columns: [
        { name: 'id', type: 'INTEGER', isPk: true, isFk: false, desc: 'Primary Key (Auto-increment)' },
        { name: 'title', type: 'TEXT', isPk: false, isFk: false, desc: 'Book title (NOT NULL)' },
        { name: 'isbn', type: 'TEXT', isPk: false, isFk: false, desc: 'International Standard Book Number (UNIQUE)' },
        { name: 'author_id', type: 'INTEGER', isPk: false, isFk: true, fkTarget: 'authors.id', desc: 'FK -> authors.id (ON DELETE RESTRICT)' },
        { name: 'category_id', type: 'INTEGER', isPk: false, isFk: true, fkTarget: 'categories.id', desc: 'FK -> categories.id (ON DELETE RESTRICT)' },
        { name: 'publisher', type: 'TEXT', isPk: false, isFk: false, desc: 'Publishing House' },
        { name: 'published_year', type: 'INTEGER', isPk: false, isFk: false, desc: 'Year published' },
        { name: 'total_copies', type: 'INTEGER', isPk: false, isFk: false, desc: 'Total physical copies owned' },
        { name: 'available_copies', type: 'INTEGER', isPk: false, isFk: false, desc: 'Copies currently on shelves' },
        { name: 'shelf_location', type: 'TEXT', isPk: false, isFk: false, desc: 'Library aisle/section locator' },
        { name: 'cover_url', type: 'TEXT', isPk: false, isFk: false, desc: 'Thumbnail cover image URL' }
      ]
    },
    {
      name: 'members',
      displayName: 'Members Entity',
      badge: 'Parent Entity',
      description: 'Registered library cardholders authorized to check out books.',
      columns: [
        { name: 'id', type: 'INTEGER', isPk: true, isFk: false, desc: 'Primary Key (Auto-increment)' },
        { name: 'card_number', type: 'TEXT', isPk: false, isFk: false, desc: 'Library barcode ID (UNIQUE)' },
        { name: 'full_name', type: 'TEXT', isPk: false, isFk: false, desc: 'Member Full Name' },
        { name: 'email', type: 'TEXT', isPk: false, isFk: false, desc: 'Unique email address' },
        { name: 'phone', type: 'TEXT', isPk: false, isFk: false, desc: 'Contact telephone' },
        { name: 'status', type: 'TEXT', isPk: false, isFk: false, desc: 'ACTIVE | SUSPENDED | EXPIRED' },
        { name: 'max_borrow_limit', type: 'INTEGER', isPk: false, isFk: false, desc: 'Concurrent borrow cap' },
        { name: 'joined_date', type: 'DATE', isPk: false, isFk: false, desc: 'Registration date' }
      ]
    },
    {
      name: 'book_loans',
      displayName: 'Book Loans (Junction Entity)',
      badge: 'Junction Entity (M:N)',
      description: 'Bridge entity that resolves Many-to-Many between Members and Books, holding loan lifecycle data.',
      columns: [
        { name: 'id', type: 'INTEGER', isPk: true, isFk: false, desc: 'Primary Key (Auto-increment)' },
        { name: 'book_id', type: 'INTEGER', isPk: false, isFk: true, fkTarget: 'books.id', desc: 'FK -> books.id (ON DELETE CASCADE)' },
        { name: 'member_id', type: 'INTEGER', isPk: false, isFk: true, fkTarget: 'members.id', desc: 'FK -> members.id (ON DELETE CASCADE)' },
        { name: 'issue_date', type: 'DATE', isPk: false, isFk: false, desc: 'Date book checked out' },
        { name: 'due_date', type: 'DATE', isPk: false, isFk: false, desc: 'Deadline for return' },
        { name: 'return_date', type: 'DATE', isPk: false, isFk: false, desc: 'Actual return date (NULL if open)' },
        { name: 'status', type: 'TEXT', isPk: false, isFk: false, desc: 'BORROWED | RETURNED | OVERDUE' },
        { name: 'fine_amount', type: 'REAL', isPk: false, isFk: false, desc: 'Late return fine ($0.75/day)' },
        { name: 'fine_paid', type: 'INTEGER', isPk: false, isFk: false, desc: '1 if settled, 0 if unpaid' },
        { name: 'notes', type: 'TEXT', isPk: false, isFk: false, desc: 'Librarian memo/remarks' }
      ]
    }
  ],
  relationships: [
    {
      from: 'authors',
      to: 'books',
      type: '1:N',
      name: 'One-to-Many',
      cardinality: 'One Author writes Many Books',
      foreignKey: 'books.author_id -> authors.id',
      explanation: 'An author can write multiple books in the library. Each book record carries a foreign key (author_id) pointing back to exactly one author.'
    },
    {
      from: 'categories',
      to: 'books',
      type: '1:N',
      name: 'One-to-Many',
      cardinality: 'One Category classifies Many Books',
      foreignKey: 'books.category_id -> categories.id',
      explanation: 'A category (e.g. Science Fiction) groups many books. The book has category_id to enforce relational integrity.'
    },
    {
      from: 'books',
      to: 'book_loans',
      type: '1:N',
      name: 'One-to-Many',
      cardinality: 'One Book title appears in Many Loan transactions',
      foreignKey: 'book_loans.book_id -> books.id',
      explanation: 'Over time, a single book can be loaned out repeatedly. Each transaction is recorded as a separate row in book_loans.'
    },
    {
      from: 'members',
      to: 'book_loans',
      type: '1:N',
      name: 'One-to-Many',
      cardinality: 'One Member has Many Loan records',
      foreignKey: 'book_loans.member_id -> members.id',
      explanation: 'A member can borrow multiple books across their membership lifecycle. Each borrow event records member_id.'
    },
    {
      from: 'members',
      to: 'books',
      type: 'M:N',
      name: 'Many-to-Many (Resolved via book_loans)',
      cardinality: 'Members <Many-to-Many> Books',
      foreignKey: 'book_loans(member_id, book_id)',
      explanation: 'A patron can borrow many books, and a book can be borrowed by many patrons. Relational databases resolve this M:N relationship by introducing book_loans as an associative entity holding extra state (due date, fine amount).'
    }
  ]
};

// Curated Educational SQL Queries
const PRESET_QUERIES = [
  {
    id: 'three_table_join',
    title: '3-Table JOIN: Active & Overdue Loans with Book & Member Info',
    description: 'Demonstrates joining the junction table `book_loans` with both parent entities (`books` and `members`).',
    sql: `SELECT 
  bl.id AS loan_id,
  m.full_name AS member_name,
  m.card_number,
  b.title AS book_title,
  b.isbn,
  bl.issue_date,
  bl.due_date,
  bl.status,
  bl.fine_amount
FROM book_loans bl
JOIN members m ON bl.member_id = m.id
JOIN books b ON bl.book_id = b.id
WHERE bl.status IN ('BORROWED', 'OVERDUE')
ORDER BY bl.due_date ASC;`
  },
  {
    id: 'author_catalog_join',
    title: '1:N JOIN: Books Grouped by Author & Category',
    description: 'Demonstrates querying Books with Author details and Genre classification via foreign keys.',
    sql: `SELECT 
  b.title,
  a.name AS author,
  a.nationality,
  c.name AS category,
  b.available_copies,
  b.total_copies
FROM books b
JOIN authors a ON b.author_id = a.id
JOIN categories c ON b.category_id = c.id
ORDER BY a.name, b.title;`
  },
  {
    id: 'aggregation_join',
    title: 'LEFT JOIN & Aggregation: Member Borrow Counts & Unpaid Fines',
    description: 'Shows how LEFT JOIN preserves members who have zero loans, while GROUP BY calculates counts.',
    sql: `SELECT 
  m.card_number,
  m.full_name,
  m.status AS member_status,
  COUNT(bl.id) AS total_loans_history,
  COUNT(CASE WHEN bl.status IN ('BORROWED', 'OVERDUE') THEN 1 END) AS active_loans,
  COALESCE(SUM(CASE WHEN bl.fine_paid = 0 THEN bl.fine_amount ELSE 0 END), 0) AS outstanding_fines
FROM members m
LEFT JOIN book_loans bl ON m.id = bl.member_id
GROUP BY m.id
ORDER BY active_loans DESC, total_loans_history DESC;`
  },
  {
    id: 'overdue_calculation',
    title: 'Overdue Fines Calculation with Date Math',
    description: 'Computes elapsed days past due date and dynamic fine accumulation ($0.75 / day).',
    sql: `SELECT 
  bl.id AS loan_id,
  m.full_name,
  m.email,
  b.title,
  bl.due_date,
  CAST((julianday('now') - julianday(bl.due_date)) AS INTEGER) AS days_late,
  ROUND((julianday('now') - julianday(bl.due_date)) * 0.75, 2) AS calculated_fine
FROM book_loans bl
JOIN members m ON bl.member_id = m.id
JOIN books b ON bl.book_id = b.id
WHERE bl.status = 'OVERDUE'
ORDER BY days_late DESC;`
  }
];

// GET /api/database/erd - Get schema metadata
router.get('/erd', (req, res) => {
  res.json({
    ...ERD_METADATA,
    presets: PRESET_QUERIES
  });
});

// GET /api/database/tables - Get live content of all relational tables
router.get('/tables', (req, res) => {
  try {
    const authors = db.prepare('SELECT * FROM authors ORDER BY id ASC').all();
    const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
    const books = db.prepare('SELECT * FROM books ORDER BY id ASC').all();
    const members = db.prepare('SELECT * FROM members ORDER BY id ASC').all();
    const book_loans = db.prepare('SELECT * FROM book_loans ORDER BY id ASC').all();

    res.json({
      authors,
      categories,
      books,
      members,
      book_loans
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/database/query - Safe SELECT query runner for learning
router.post('/query', (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'SQL query string required' });
    }

    const trimmed = sql.trim();
    // Safety check: allow only SELECT queries for the visual explorer
    if (!/^SELECT\b/i.test(trimmed)) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed in the educational query runner.' });
    }

    const startTime = process.hrtime();
    const rows = db.prepare(trimmed).all();
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const executionMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    res.json({
      success: true,
      rowCount: rows.length,
      executionMs: `${executionMs} ms`,
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      rows
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

