const express = require('express');
const router = express.Router();
const searchService = require('../services/navSearch.service');


router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.json([]);
    }

    const results = await searchService.searchBooksAndCategories(query);
    res.json(results);
  } catch (err) {
    console.error('Error in search route:', err);
    res.status(500).json({ success: false, message: 'Error searching' });
  }
});

module.exports = router;
