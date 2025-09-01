const express = require('express');
const router = express.Router();
const searchService = require('../services/navSearch.service');
const { authenticate } = require("../middleware/auth.middleware");


router.get('/', authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.json([]);
    }

    const result = await searchService.searchBooksAndCategories(query);

    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    console.error('Error in search route:', err);
    res.status(500).json({ success: false, message: 'Error searching' });
  }
});

module.exports = router;
