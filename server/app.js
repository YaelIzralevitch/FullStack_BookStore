const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require("./routes/auth.router");

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

module.exports = app;
