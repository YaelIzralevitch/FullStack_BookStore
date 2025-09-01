const express = require('express');
const router = express.Router();
const booksService = require('../services/books.service');
const { authenticate } = require("../middleware/auth.middleware");

router.get('/category/:categoryId', authenticate, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const books = await booksService.getBooksByCategory(categoryId);
    res.json({ success: true, data: books.data });
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

    res.json({ success: true, data: book.data });
  } catch (err) {
    console.error('ERROR IN getBookById route:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const options = {
      categoryId: parseInt(req.query.categoryId),
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || '',
      sortOrder: req.query.sortOrder || 'ASC'
    };

    if (!options.categoryId || isNaN(options.categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid category ID is required"
      });
    }

    const validSortFields = ['title', 'price', ''];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (!validSortFields.includes(options.sortBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field"
      });
    }

    if (!validSortOrders.includes(options.sortOrder.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort order"
      });
    }

    options.sortOrder = options.sortOrder.toUpperCase();

    const result = await booksService.getBooksByCategoryWithPagination(options);
    
    if (result.code !== 200) {
      return res.status(result.code).json({
        success: false,
        message: result.msg
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('ERROR IN GET /books/category:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
