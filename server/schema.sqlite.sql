-- ==========================================================
-- 📚 LIBRARY MANAGEMENT SYSTEM - SQLITE RELATIONAL SCHEMA
-- Illustrating Database Entity Relationships (1:N and M:N)
-- ==========================================================

PRAGMA foreign_keys = ON;

-- 1. Authors Entity (1 : N with Books)
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bio TEXT,
  born_year INTEGER,
  nationality TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Entity (1 : N with Books)
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6'
);

-- 3. Books Entity
-- Foreign Keys:
--   author_id   -> authors(id)    [Many books belong to One author]
--   category_id -> categories(id) [Many books belong to One category]
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  author_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  publisher TEXT,
  published_year INTEGER,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  shelf_location TEXT,
  cover_url TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 4. Members Entity (Library Patrons)
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'EXPIRED'
  max_borrow_limit INTEGER DEFAULT 5,
  joined_date DATE DEFAULT (DATE('now')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Book Loans Entity (Junction / Bridge Entity for M:N Relationship)
-- Resolves the Many-to-Many relationship between Members and Books.
-- Tracks the lifecycle of a borrow transaction (issue, due date, return date, fine).
-- Foreign Keys:
--   book_id   -> books(id)   [Which book is loaned]
--   member_id -> members(id) [Who borrowed the book]
CREATE TABLE IF NOT EXISTS book_loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT DEFAULT 'BORROWED', -- 'BORROWED', 'RETURNED', 'OVERDUE'
  fine_amount REAL DEFAULT 0.00,
  fine_paid INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Indexes for performance & quick JOIN lookups
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_loans_book ON book_loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_member ON book_loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON book_loans(status);

