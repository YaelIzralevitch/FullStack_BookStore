const express = require("express");
const router = express.Router();
const usersService = require("../services/users.service");
const { authenticate, authorizeOwner } = require("../middleware/auth.middleware");
const { validateUserUpdate } = require("../middleware/users.validation");

/**
 * עדכון פרטי משתמש
 * PUT /api/users/:userId
 */
router.put("/:userId", authenticate, authorizeOwner, validateUserUpdate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const updateData = req.body;
    
    const result = await usersService.updateUserDetails(userId, updateData);
    
    if (result.code !== 200) {
      return res.status(result.code).json({ 
        success: false, 
        message: result.msg 
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('ERROR IN PUT /users/:userId:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

/**
 * קבלת פרטי משתמש
 * GET /api/users/:userId
 */
router.get("/:userId", authenticate, authorizeOwner, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await usersService.getUserById(userId);
    
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
    console.error('ERROR IN GET /users/:userId:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;