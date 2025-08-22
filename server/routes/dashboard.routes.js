const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboard.service");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");
const { validateYear } = require("../middleware/dashboard.validation");

/**
 * קבלת נתוני דשבורד
 * GET /api/dashboard?year=2024
 */
router.get("/", authenticate, requireAdmin, validateYear, async (req, res) => {
  try {
    const result = await dashboardService.getDashboardData(req.year);

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
    console.error('ERROR IN GET /dashboard:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * קבלת שנים זמינות
 * GET /api/dashboard/years
 */
router.get("/years", authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await dashboardService.getAvailableYears();

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
    console.error('ERROR IN GET /dashboard/years:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;