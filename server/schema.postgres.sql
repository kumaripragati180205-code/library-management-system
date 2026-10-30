-- ==========================================================
-- 📚 LIBRARY MANAGEMENT SYSTEM - POSTGRESQL RELATIONAL SCHEMA
-- Illustrating Database Entity Relationships (1:N and M:N)
-- ==========================================================

-- 1. Authors Entity (1 : N with Books)
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  bio TEXT,
  born_year INTEGER,
  nationality VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Entity (1 : N with Books)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3b82f6'
);

-- 3. Books Entity
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  publisher VARCHAR(150),
  published_year INTEGER,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  shelf_location VARCHAR(50),
  cover_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Members Entity (Library Patrons)
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  card_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'EXPIRED'
  max_borrow_limit INTEGER DEFAULT 5,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Book Loans Entity (Junction / Bridge Entity for M:N Relationship)
CREATE TABLE IF NOT EXISTS book_loans (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status VARCHAR(20) DEFAULT 'BORROWED', -- 'BORROWED', 'RETURNED', 'OVERDUE'
  fine_amount NUMERIC(10, 2) DEFAULT 0.00,
  fine_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & quick JOIN lookups
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_loans_book ON book_loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_member ON book_loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON book_loans(status);

