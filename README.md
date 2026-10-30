# 📚 Athenaeum — Relational Library Management System

A full-stack, responsive, and visually appealing Library Management System built with **React**, **Node.js**, **Express**, and **Relational SQL Database** (SQLite with zero-setup embedded engine + ready-to-use **PostgreSQL** schema).

Designed with a core emphasis on **understanding relationships between database entities** (One-to-Many, Many-to-Many via Junction Entities, Foreign Key Constraints, and ACID Transactions).

---

## ✨ Features

- 📖 **Add & Manage Books**: Catalog management with title, author, genre/category, ISBN, shelf location, stock copies, and cover previews.
- 👥 **Register Library Members**: Member management with barcode/card numbers, borrow quotas, active checkouts tracking, and contact details.
- 🔄 **Issue & Return Books**: ACID transactional checkouts that automatically decrement/restore inventory copies, validate member limits, and log checkout dates.
- ⚠️ **Track Overdue Books**: Real-time detection of overdue items, day counters, automatic late fee calculations ($0.75/day), and quick contact actions (email/call).
- 🔍 **Real-time Search & Filter**: Search books by title, author name, or ISBN, with genre pills and "In Stock Only" filters.
- 🧩 **Interactive Entity Relationship Explorer (ERD & SQL Playground)**:
  - Interactive diagram mapping **Authors**, **Categories**, **Books**, **Members**, and **Book Loans**.
  - Detailed column specifications with Primary Keys (`PK`) and Foreign Keys (`FK`).
  - Explanations of `1:N` and `M:N` relationships, Cascade rules, and Referentials.
  - Live database inspector across all 5 relational tables.
  - Interactive SQL Playground with preset JOIN queries and live query execution.

---

## 🗄️ Relational Database Schema & Entities

```
  +--------------+               +-----------------+
  |   authors    |               |   categories    |
  |--------------|               |-----------------|
  | PK id        |               | PK id           |
  |    name      |               |    name         |
  +-------+------+               +--------+--------+
          | 1                             | 1
          | (writes)                      | (classifies)
          | N                             | N
      +---+-------------------------------+---+
      |                 books                 |
      |---------------------------------------|
      | PK id                                 |
      | FK author_id   -> authors(id)         |
      | FK category_id -> categories(id)      |
      |    title, isbn, copies, etc.          |
      +-------------------+-------------------+
                          | 1
                          | (loaned in)
                          | N
               +----------+----------+
               |     book_loans      |  <-- Junction Entity (M : N)
               |---------------------|
               | PK id               |
               | FK book_id          |
               | FK member_id        |
               |    issue_date       |
               |    due_date         |
               |    return_date      |
               |    status, fine     |
               +----------+----------+
                          | N
                          | (borrows)
                          | 1
                  +-------+-------+
                  |    members    |
                  |---------------|
                  | PK id         |
                  |    card_num   |
                  |    full_name  |
                  +---------------+
```

### Entity Relationships Breakdown
1. **`authors` ──(1 : N)──> `books`**: One author can write many books. `books.author_id` is a Foreign Key referencing `authors.id`.
2. **`categories` ──(1 : N)──> `books`**: One genre categorizes many books. `books.category_id` is a Foreign Key referencing `categories.id`.
3. **`members` ──(M : N)──> `books`**: Resolved via the **`book_loans`** junction table, which carries transaction state (issue date, due date, return date, and late fees).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Launching

1. **Install Dependencies & Start the Backend**:
   ```bash
   cd server
   npm install
   node index.js
   ```
   *The server runs on `http://localhost:5000` with the pre-seeded SQLite database `library.db` and static frontend hosting.*

2. **Run the React Frontend in Development Mode (Vite)**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Open `http://localhost:3000` in your browser.*

### Using PostgreSQL (Optional)
If you prefer running on a PostgreSQL instance (e.g., Supabase, Neon, or local Docker):
1. Import `server/schema.postgres.sql` into your PostgreSQL database.
2. In `server/.env`, set:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/library_db
   ```

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, better-sqlite3, pg (node-postgres), CORS, dotenv
- **Database**: SQLite (built-in zero-configuration) + PostgreSQL equivalent schema

