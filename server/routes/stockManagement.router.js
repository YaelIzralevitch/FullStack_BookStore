const express = require('express');
const router = express.Router();
const inventoryService = require('../services/stockManagement.service');
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");
const { validateBookData, validateBookUpdate, validateCategoryData } = require("../middleware/stockManagement.validation");


// ====== categories ======
router.get('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const categories = await inventoryService.getAllCategories();
     res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/category', authenticate, validateCategoryData, requireAdmin, async (req, res) => {
  try {
    const result = await inventoryService.createCategory(req.body);
    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/category/:id', authenticate, validateCategoryData, requireAdmin, async (req, res) => {
  try {
    const result = await inventoryService.updateCategory(req.params.id, req.body);
    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/category/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await inventoryService.deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ====== books ======
router.get('/books/:categoryId', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await inventoryService.getBooksByCategory(req.params.categoryId);
    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/book', authenticate, validateBookData, requireAdmin, async (req, res) => {
  try {
    const result = await inventoryService.createBook(req.body);
    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/book/:id', authenticate, validateBookUpdate, requireAdmin, async (req, res) => {
  try {
    
    await inventoryService.updateBook(req.params.id, req.body);
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/book/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await inventoryService.deleteBook(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/category", authenticate, requireAdmin, requireAdmin, async (req, res) => {
  try {
    const options = {
      categoryId: parseInt(req.query.categoryId),
      search: req.query.search || '',
      sortBy: req.query.sortBy || 'title',
      sortOrder: req.query.sortOrder || 'ASC',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    if (!options.categoryId || isNaN(options.categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid category ID is required"
      });
    }

    const validSortFields = ['title', 'author', 'price', 'stock_quantity'];
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

    const result = await inventoryService.getBooksByCategoryWithPagination(options);
    
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
