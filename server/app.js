const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require("./routes/auth.router");
const usersRouter = require("./routes/users.router");
const cardsRouter = require("./routes/cards.router");
const categoriesRouter = require("./routes/categories.router");
const booksRouter = require('./routes/books.router');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // כתובת הקליינט שלך
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use("/api/auth", authRouter);
app.use('/api/users', usersRouter);
app.use('/api/cards', cardsRouter);
app.use("/api/categories", categoriesRouter);
app.use('/api/books', booksRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

module.exports = app;
