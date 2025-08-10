const express = require("express");
const router = express.Router();
const cardsService = require("../services/cards.service");
const { authenticate, authorizeOwner } = require("../middleware/auth.middleware");
const { validateCreditCardAdd } = require("../middleware/cards.validation");

/**
 * קבלת פרטי כרטיס אשראי
 * GET /api/users/:userId
 */
router.get("/:userId", authenticate, authorizeOwner, async (req, res) => {
  try {

    const userId = parseInt(req.params.userId);

    const result = await cardsService.getUserCreditCard(userId);

    if (result.code !== 200) {
      return res.status(result.code).json({ 
        success: false, 
        message: result.msg 
      });
    }

    res.json({
      success: true,
      message: result.msg,
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

/**
 * הוספת כרטיס אשראי
 * POST /api/users/:userId
 */
router.post("/:userId", authenticate, authorizeOwner, validateCreditCardAdd, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const creditCardData = req.body;

    const result = await cardsService.addUserCreditCard(userId, creditCardData);
    
    if (result.code !== 200) {
      return res.status(result.code).json({ 
        success: false, 
        message: result.msg 
      });
    }

    res.json({
      success: true,
      message: result.msg
    });
  } catch (error) {
    console.error('ERROR IN POST /users/:userId:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

/**
 * מחיקת כרטיס אשראי
 * DELETE /api/users/:userId
 */
router.delete("/:userId", authenticate, authorizeOwner, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await cardsService.deleteUserCreditCard(userId);
    
    if (result.code !== 200) {
      return res.status(result.code).json({ 
        success: false, 
        message: result.msg 
      });
    }

    res.json({
      success: true,
      message: result.msg
    });
  } catch (error) {
    console.error('ERROR IN DELETE /users/:userId:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;