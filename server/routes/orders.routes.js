const express = require("express");
const router = express.Router();
const ordersService = require("../services/orders.service");
const { authenticate, authorizeOwner } = require("../middleware/auth.middleware");
const { validateOrderCreation } = require("../middleware/orders.validation");


/**
 * יצירת הזמנה חדשה עם תשלום
 * POST /api/orders/checkout
 */
router.post("/checkout", authenticate, validateOrderCreation, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.orderData; // מגיע מה-middleware
    const paymentData = req.paymentData; // מגיע מה-middleware

    const result = await ordersService.createOrderWithPayment(userId, orderData, paymentData);

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
    console.error('ERROR IN POST /orders/checkout:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


/**
 * קבלת היסטוריית הזמנות של משתמש
 * GET /api/orders/user/:userId
 */
router.get("/user/:userId", authenticate, authorizeOwner, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await ordersService.getUserOrderHistory(userId);
    console.log('GET /orders/user/:userId result:', result);

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
    console.error('ERROR IN GET /orders/user/:userId:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

/**
 * קבלת פרטי הזמנה בודדת
 * GET /api/orders/:orderId/user/:userId
 */
router.get("/:orderId/user/:userId", authenticate, authorizeOwner, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = parseInt(req.params.userId);

    const result = await ordersService.getOrderDetails(orderId, userId);

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
    console.error('ERROR IN GET /orders/:orderId/user/:userId:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;