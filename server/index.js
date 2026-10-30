const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const booksRouter = require('./routes/books');
const membersRouter = require('./routes/members');
const loansRouter = require('./routes/loans');
const authorsRouter = require('./routes/authors');
const categoriesRouter = require('./routes/categories');
const databaseRouter = require('./routes/database');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/database', databaseRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Library Management System API is healthy'
  });
});

// Serve frontend static build if exists
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    // If request does not start with /api, serve index.html
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Library Management System Server running on http://localhost:${PORT}`);
});
