const express = require('express');
const router = express.Router();
const booksService = require('../services/books.service');
const { authenticate } = require("../middleware/auth.middleware");

// GET /api/books/category/:categoryId
router.get('/category/:categoryId', authenticate, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const books = await booksService.getBooksByCategory(categoryId);
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get('/:bookId', authenticate, async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await booksService.getBookById(bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, data: book });
  } catch (err) {
    console.error('ERROR IN getBookById route:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
