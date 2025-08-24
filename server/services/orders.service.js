const ordersController = require("../controllers/orders.controller");
const cardsController = require("../controllers/cards.controller");
const usersController = require("../controllers/users.controller");


/**
 * יצירת הזמנה חדשה עם תשלום
 */
async function createOrderWithStripePayment(userId, orderData, paymentData) {
  try {

    const user = await usersController.getUserById(userId);
    const userEmail = user.email;
    
    // עיבוד התשלום עם Stripe
    const paymentResult = await cardsController.processStripePayment(
      userId,
      userEmail, 
      orderData.totalPrice, 
      paymentData
    );
    
    if (!paymentResult.success) {
      return {
        code: 400,
        msg: paymentResult.message || "Payment failed"
      };
    }
    
    // יצירת ההזמנה
    const orderResult = await ordersController.createOrder(userId, orderData);

    return {
      code: 200,
      data: {
        orderId: orderResult.orderId,
        paymentIntentId: paymentResult.paymentIntentId,
      }
    };

  } catch (error) {
    console.error('ERROR IN createOrderWithStripePayment service:', error);
    return { 
      code: 500, 
      msg: error.message || "Failed to create order with Stripe" 
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
      data: order
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
async function getOrdersForAdmin(options) {
  try {
    const result = await ordersController.getOrders(options);
    
    return {
      code: 200,
      data: result
    };
  } catch (error) {
    console.error('ERROR IN getOrdersForAdmin service:', error);
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
      data: result
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
  createOrderWithStripePayment,
  getOrdersForAdmin,
  updateOrderStatus
};