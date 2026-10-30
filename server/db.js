const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'library.db');
const db = new Database(dbPath, {
  // verbose: console.log
});

// Enable Foreign Key enforcement
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaSql = fs.readFileSync(path.resolve(__dirname, 'schema.sqlite.sql'), 'utf-8');
db.exec(schemaSql);

// Helper function to update overdue status & fines
function refreshOverdueLoans() {
  const today = new Date().toISOString().split('T')[0];
  
  // Find all active loans past due date
  const updateStmt = db.prepare(`
    UPDATE book_loans
    SET status = 'OVERDUE',
        fine_amount = ROUND(
          (julianday(?) - julianday(due_date)) * 0.75, 2
        )
    WHERE return_date IS NULL
      AND due_date < ?
      AND (status != 'OVERDUE' OR fine_amount != ROUND((julianday(?) - julianday(due_date)) * 0.75, 2))
  `);
  updateStmt.run(today, today, today);
}

// Seed initial data if database is empty
function seedData() {
  const authorCount = db.prepare('SELECT COUNT(*) as count FROM authors').get().count;
  if (authorCount > 0) {
    refreshOverdueLoans();
    return;
  }

  console.log('🌱 Seeding initial library dataset with relational entities...');

  const insertAuthor = db.prepare(`
    INSERT INTO authors (name, bio, born_year, nationality)
    VALUES (?, ?, ?, ?)
  `);

  const authors = [
    ['F. Scott Fitzgerald', 'American novelist whose works illustrate the Jazz Age.', 1896, 'American'],
    ['George Orwell', 'English novelist, essayist, journalist, and critic.', 1903, 'British'],
    ['Harper Lee', 'American novelist best known for To Kill a Mockingbird.', 1926, 'American'],
    ['Frank Herbert', 'American science fiction author best known for the novel Dune.', 1920, 'American'],
    ['Martin Kleppmann', 'Associate Professor at University of Cambridge, expert on distributed systems.', 1983, 'British-German'],
    ['Robert C. Martin', 'American software engineer and author of Clean Code.', 1952, 'American'],
    ['Andy Weir', 'American novelist renowned for realistic science fiction such as The Martian.', 1972, 'American'],
    ['Mary Shelley', 'English novelist who wrote the Gothic masterpiece Frankenstein.', 1797, 'British']
  ];

  const authorIds = {};
  authors.forEach(([name, bio, born, nat]) => {
    const res = insertAuthor.run(name, bio, born, nat);
    authorIds[name] = res.lastInsertRowid;
  });

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, description, color)
    VALUES (?, ?, ?)
  `);

  const categories = [
    ['Classic Literature', 'Timeless masterpieces of world literature.', '#f59e0b'],
    ['Science Fiction', 'Futuristic science, space travel, and technology.', '#3b82f6'],
    ['Computer Science', 'Software engineering, algorithms, and distributed systems.', '#10b981'],
    ['Dystopian & Political', 'Explorations of society, totalitarianism, and freedom.', '#ef4444'],
    ['Gothic & Horror', 'Dark romanticism, thrillers, and psychological depth.', '#8b5cf6']
  ];

  const categoryIds = {};
  categories.forEach(([name, desc, color]) => {
    const res = insertCategory.run(name, desc, color);
    categoryIds[name] = res.lastInsertRowid;
  });

  const insertBook = db.prepare(`
    INSERT INTO books (title, isbn, author_id, category_id, publisher, published_year, total_copies, available_copies, shelf_location, cover_url, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const books = [
    [
      'The Great Gatsby',
      '978-0743273565',
      authorIds['F. Scott Fitzgerald'],
      categoryIds['Classic Literature'],
      'Scribner',
      1925,
      4,
      3,
      'A-102',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
      'A portrait of the Jazz Age that has been acclaimed as one of the greatest novels in American literature.'
    ],
    [
      '1984',
      '978-0451524935',
      authorIds['George Orwell'],
      categoryIds['Dystopian & Political'],
      'Secker & Warburg',
      1949,
      5,
      2,
      'B-204',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop',
      'A dystopian social science fiction novel that examines surveillance, truth, and authoritarianism.'
    ],
    [
      'To Kill a Mockingbird',
      '978-0061120084',
      authorIds['Harper Lee'],
      categoryIds['Classic Literature'],
      'J. B. Lippincott & Co.',
      1960,
      3,
      2,
      'A-105',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
      'A gripping, heart-wrenching tale of coming-of-age and racial injustice in the American South.'
    ],
    [
      'Dune',
      '978-0441013593',
      authorIds['Frank Herbert'],
      categoryIds['Science Fiction'],
      'Chilton Books',
      1965,
      6,
      4,
      'C-301',
      'https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=600&auto=format&fit=crop',
      'Set on the desert planet Arrakis, Dune tells the story of the boy Paul Atreides and the precious spice melange.'
    ],
    [
      'Designing Data-Intensive Applications',
      '978-1449373320',
      authorIds['Martin Kleppmann'],
      categoryIds['Computer Science'],
      "O'Reilly Media",
      2017,
      4,
      1,
      'D-401',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop',
      'The definitive guide to the fundamental principles, architectures, and trade-offs of data systems.'
    ],
    [
      'Clean Code: A Handbook of Agile Software Craftsmanship',
      '978-0132350884',
      authorIds['Robert C. Martin'],
      categoryIds['Computer Science'],
      'Prentice Hall',
      2008,
      5,
      3,
      'D-402',
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?q=80&w=600&auto=format&fit=crop',
      'Best practices, code smells, and heuristics for writing clean, readable, and maintainable software.'
    ],
    [
      'Project Hail Mary',
      '978-0593135204',
      authorIds['Andy Weir'],
      categoryIds['Science Fiction'],
      'Ballantine Books',
      2021,
      4,
      2,
      'C-304',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
      'A lone astronaut must save the Earth from an extinction-level catastrophe in this thrilling interstellar journey.'
    ],
    [
      'Frankenstein',
      '978-0141439471',
      authorIds['Mary Shelley'],
      categoryIds['Gothic & Horror'],
      'Lackington, Hughes, Harding, Mavor & Jones',
      1818,
      3,
      3,
      'E-501',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop',
      'The classic Gothic tale of Victor Frankenstein and the sentient creature he creates in an unorthodox experiment.'
    ]
  ];

  const bookIds = {};
  books.forEach(b => {
    const res = insertBook.run(...b);
    bookIds[b[0]] = res.lastInsertRowid;
  });

  const insertMember = db.prepare(`
    INSERT INTO members (card_number, full_name, email, phone, status, max_borrow_limit, joined_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const members = [
    ['LIB-2024-001', 'Elena Rostova', 'elena.rostova@example.com', '+1 (555) 234-5678', 'ACTIVE', 5, '2024-01-15'],
    ['LIB-2024-002', 'Marcus Chen', 'marcus.chen@example.com', '+1 (555) 345-6789', 'ACTIVE', 5, '2024-02-10'],
    ['LIB-2024-003', 'Aisha Al-Mansoor', 'aisha.mansoor@example.com', '+1 (555) 456-7890', 'ACTIVE', 6, '2024-03-01'],
    ['LIB-2024-004', 'Liam O\'Connor', 'liam.oconnor@example.com', '+1 (555) 567-8901', 'ACTIVE', 4, '2024-03-22'],
    ['LIB-2024-005', 'Sophia Rodriguez', 'sophia.rodriguez@example.com', '+1 (555) 678-9012', 'ACTIVE', 5, '2024-04-05'],
    ['LIB-2024-006', 'Devon Vance', 'devon.vance@example.com', '+1 (555) 789-0123', 'SUSPENDED', 2, '2023-11-12']
  ];

  const memberIds = {};
  members.forEach(m => {
    const res = insertMember.run(...m);
    memberIds[m[1]] = res.lastInsertRowid;
  });

  const insertLoan = db.prepare(`
    INSERT INTO book_loans (book_id, member_id, issue_date, due_date, return_date, status, fine_amount, fine_paid, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Today's date reference
  const d = new Date();
  const formatOffset = (days) => {
    const target = new Date(d.getTime() + days * 86400000);
    return target.toISOString().split('T')[0];
  };

  // Seed loans: Overdue, Active, and Returned
  const sampleLoans = [
    // 1. OVERDUE loan: 1984 borrowed 20 days ago, due 6 days ago
    [bookIds['1984'], memberIds['Elena Rostova'], formatOffset(-20), formatOffset(-6), null, 'OVERDUE', 4.50, 0, 'First reminder email sent.'],
    // 2. OVERDUE loan: Designing Data-Intensive Applications borrowed 25 days ago, due 11 days ago
    [bookIds['Designing Data-Intensive Applications'], memberIds['Marcus Chen'], formatOffset(-25), formatOffset(-11), null, 'OVERDUE', 8.25, 0, 'Late return warning issued.'],
    // 3. ACTIVE loan (due in 8 days)
    [bookIds['1984'], memberIds['Aisha Al-Mansoor'], formatOffset(-6), formatOffset(8), null, 'BORROWED', 0.00, 0, 'Standard 14-day checkout.'],
    // 4. ACTIVE loan (due in 12 days)
    [bookIds['Dune'], memberIds['Liam O\'Connor'], formatOffset(-2), formatOffset(12), null, 'BORROWED', 0.00, 0, 'Requested extension capability.'],
    // 5. ACTIVE loan (due in 5 days)
    [bookIds['Dune'], memberIds['Devon Vance'], formatOffset(-9), formatOffset(5), null, 'BORROWED', 0.00, 0, 'Regular borrow.'],
    // 6. ACTIVE loan (due in 10 days)
    [bookIds['Project Hail Mary'], memberIds['Elena Rostova'], formatOffset(-4), formatOffset(10), null, 'BORROWED', 0.00, 0, 'Sci-Fi book club selection.'],
    // 7. ACTIVE loan (due in 3 days)
    [bookIds['Clean Code: A Handbook of Agile Software Craftsmanship'], memberIds['Sophia Rodriguez'], formatOffset(-11), formatOffset(3), null, 'BORROWED', 0.00, 0, 'Research for coding standards.'],
    // 8. ACTIVE loan (due in 7 days)
    [bookIds['Clean Code: A Handbook of Agile Software Craftsmanship'], memberIds['Marcus Chen'], formatOffset(-7), formatOffset(7), null, 'BORROWED', 0.00, 0, 'Agile sprint reading.'],
    // 9. RETURNED loan (on time)
    [bookIds['The Great Gatsby'], memberIds['Devon Vance'], formatOffset(-35), formatOffset(-21), formatOffset(-22), 'RETURNED', 0.00, 0, 'Returned in pristine condition.'],
    // 10. RETURNED loan (late with paid fine)
    [bookIds['To Kill a Mockingbird'], memberIds['Aisha Al-Mansoor'], formatOffset(-40), formatOffset(-26), formatOffset(-23), 'RETURNED', 2.25, 1, 'Late return fine settled in person.']
  ];

  sampleLoans.forEach(l => insertLoan.run(...l));

  refreshOverdueLoans();
  console.log('✅ Relational dataset seeded successfully!');
}

seedData();

module.exports = {
  db,
  refreshOverdueLoans
};

