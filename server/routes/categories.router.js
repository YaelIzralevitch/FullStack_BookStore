const express = require("express");
const router = express.Router();
const categoriesService = require("../services/categories.service");

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await categoriesService.listCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/categories/:id
router.get("/:id", async (req, res) => {
  try {
    const category = await categoriesService.getCategory(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
