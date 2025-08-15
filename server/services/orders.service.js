const ordersController = require("../controllers/orders.controller");


/**
 * יצירת הזמנה חדשה עם תשלום
 */
async function createOrderWithPayment(userId, orderData, paymentData) {
  try {
    // עיבוד התשלום
    const paymentResult = await ordersController.processPayment(paymentData);
    
    if (!paymentResult.success) {
      return {
        code: 400,
        msg: paymentResult.message
      };
    }

    // יצירת ההזמנה
    const orderResult = await ordersController.createOrder(userId, orderData);

    return {
      code: 200,
      data: {
        orderId: orderResult.orderId,
        transactionId: paymentResult.transactionId
      },
      msg: "Order created and payment processed successfully"
    };

  } catch (error) {
    console.error('ERROR IN createOrderWithPayment service:', error);
    return { 
      code: 500, 
      msg: error.message || "Failed to create order" 
    };
  }
}

/**
 * קבלת היסטוריית הזמנות של משתמש
 */
async function getUserOrderHistory(userId) {
  try {
    const orders = await ordersController.getUserOrders(userId);
    
    return {
      code: 200,
      data: orders,
      msg: orders.length > 0 ? "Orders retrieved successfully" : "No orders found"
    };
  } catch (error) {
    console.error('ERROR IN getUserOrderHistory service:', error);
    return { 
      code: 500, 
      msg: error.message || "Failed to retrieve order history" 
    };
  }
}

/**
 * קבלת הזמנה בודדת
 */
async function getOrderDetails(orderId, userId) {
  try {
    const order = await ordersController.getOrderById(orderId, userId);
    
    if (!order) {
      return { 
        code: 404, 
        msg: "Order not found or access denied" 
      };
    }

    return {
      code: 200,
      data: order,
      msg: "Order details retrieved successfully"
    };
  } catch (error) {
    console.error('ERROR IN getOrderDetails service:', error);
    return { 
      code: 500, 
      msg: error.message || "Failed to retrieve order details" 
    };
  }
}


/**
 * קבלת כל ההזמנות (לאדמין)
 */
async function getAllOrdersForAdmin(options) {
  try {
    const result = await ordersController.getAllOrders(options);
    
    return {
      code: 200,
      data: result,
      msg: `Found ${result.totalCount} orders`
    };
  } catch (error) {
    console.error('ERROR IN getAllOrdersForAdmin service:', error);
    return { 
      code: 500, 
      msg: error.message || "Failed to retrieve orders" 
    };
  }
}

/**
 * עדכון סטטוס הזמנה (לאדמין)
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    const result = await ordersController.updateOrderStatus(orderId, newStatus);
    
    return {
      code: 200,
      data: result,
      msg: "Order status updated successfully"
    };
  } catch (error) {
    console.error('ERROR IN updateOrderStatus service:', error);
    return { 
      code: 500, 
      msg: error.message || "Failed to update order status" 
    };
  }
}

module.exports = {
  getUserOrderHistory,
  getOrderDetails,
  createOrderWithPayment,
  getAllOrdersForAdmin,
  updateOrderStatus
};