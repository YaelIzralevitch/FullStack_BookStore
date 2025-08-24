const express = require('express');
const router = express.Router();
const inventoryService = require('../services/stockManagement.service');
const { authenticate } = require("../middleware/auth.middleware");
const { validateBookData, validateCategoryData } = require("../middleware/stockManagement.validation");


// ====== קטגוריות ======
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await inventoryService.getAllCategories();
     res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/category', authenticate, validateCategoryData, async (req, res) => {
  try {
    const category = await inventoryService.createCategory(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/category/:id', authenticate, validateCategoryData, async (req, res) => {
  try {
    const category = await inventoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/category/:id', authenticate,async (req, res) => {
  try {
    await inventoryService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ====== ספרים ======
router.get('/books/:categoryId', authenticate, async (req, res) => {
  try {
    const books = await inventoryService.getBooksByCategory(req.params.categoryId);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/book', authenticate, validateBookData, async (req, res) => {
  try {
    const book = await inventoryService.createBook(req.body);
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/book/:id', authenticate, validateBookData, async (req, res) => {
  try {
    const book = await inventoryService.updateBook(req.params.id, req.body);
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/book/:id', authenticate, async (req, res) => {
  try {
    await inventoryService.deleteBook(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
