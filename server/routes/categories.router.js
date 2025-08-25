const express = require("express");
const router = express.Router();
const categoriesService = require("../services/categories.service");
const { authenticate } = require("../middleware/auth.middleware");

// GET /api/categories
router.get("/", authenticate, async (req, res) => {
  try {
    const categories = await categoriesService.listCategories();
    res.json({ success: true, data: categories.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/categories/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const category = await categoriesService.getCategory(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
