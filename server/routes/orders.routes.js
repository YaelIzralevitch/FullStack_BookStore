const express = require("express");
const router = express.Router();
const ordersService = require("../services/orders.service");
const { authenticate, authorizeOwner, requireAdmin } = require("../middleware/auth.middleware");
const { validateOrderCreation, validateOrderId, validatePaymentData } = require("../middleware/orders.validation");


/**
 * יצירת הזמנה חדשה עם תשלום
 * POST /api/orders/checkout
 */
router.post("/checkout", authenticate, validateOrderCreation, validatePaymentData, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.orderData; // מגיע מה-middleware
    const paymentData = req.paymentData; // מגיע מה-middleware

    const result = await ordersService.createOrderWithStripePayment(
      userId, 
      orderData, 
      paymentData
    );

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
    console.error('ERROR IN POST /orders/checkout-stripe:', error);
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


/**
 * קבלת כל ההזמנות (לאדמין)
 * GET /api/orders/admin?search=&status=&sortBy=&sortOrder=&page=&limit=
 */
router.get("/admin", authenticate, requireAdmin, async (req, res) => {
  try {
    const options = {
      search: req.query.search || '',
      status: req.query.status || '',
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    // ולידציה בסיסית
    const validSortFields = ['created_at', 'total_price', 'order_status'];
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

    const result = await ordersService.getAllOrdersForAdmin(options);

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
    console.error('ERROR IN GET /orders/admin:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * קבלת פרטי הזמנה (לאדמין)
 * GET /api/orders/admin/:orderId
 */
router.get("/admin/:orderId", authenticate, requireAdmin, validateOrderId, async (req, res) => {
  try {
    const orderId = req.orderId; // מגיע מה-middleware

    const result = await ordersService.getOrderDetails(orderId); // ללא userId כי זה אדמין

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
    console.error('ERROR IN GET /orders/admin/:orderId:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


/**
 * עדכון סטטוס הזמנה (לאדמין)
 * PUT /api/orders/admin/:orderId/status
 */
router.put("/admin/:orderId/status", authenticate, requireAdmin, validateOrderId, async (req, res) => {
  try {
    const orderId = req.orderId; // מגיע מה-middleware
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const validStatuses = ['paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid options: paid, cancelled"
      });
    }

    const result = await ordersService.updateOrderStatus(orderId, status);

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
    console.error('ERROR IN PUT /orders/admin/:orderId/status:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;