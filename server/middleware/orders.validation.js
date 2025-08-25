
/**
 * validation middleware for order operations
 */
function validateOrderCreation(req, res, next) {
  const { orderData } = req.body;

  // check orderData exists
  if (!orderData) {
    return res.status(400).json({
      success: false,
      message: "Order data is required"
    });
  }

  // check items array
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order must contain at least one item"
    });
  }

  // check each item
  for (let i = 0; i < orderData.items.length; i++) {
    const item = orderData.items[i];
    
    if (!item.id || typeof item.id !== 'number') {
      return res.status(400).json({
        success: false,
        message: `Invalid book ID for item ${i + 1}`
      });
    }

    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid quantity for item ${i + 1}. Must be a positive number`
      });
    }

    if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid price for item ${i + 1}. Must be a positive number`
      });
    }

    if (!item.title || typeof item.title !== 'string' || item.title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid title for item ${i + 1}`
      });
    }
  }

  // check totalPrice
  if (!orderData.totalPrice || typeof orderData.totalPrice !== 'number' || orderData.totalPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid total price. Must be a positive number"
    });
  }

  // calculate total from items and compare
  const calculatedTotal = orderData.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const tolerance = 0.01; // tolerance for floating point
  if (Math.abs(calculatedTotal - orderData.totalPrice) > tolerance) {
    return res.status(400).json({
      success: false,
      message: "Total price doesn't match calculated sum of items"
    });
  }

  // check shipping address
  if (!orderData.shippingAddress) {
    return res.status(400).json({
      success: false,
      message: "Shipping address is required"
    });
  }

  const address = orderData.shippingAddress;
  if (!address.street || typeof address.street !== 'string' || address.street.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Street address is required"
    });
  }

  if (!address.city || typeof address.city !== 'string' || address.city.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "City is required"
    });
  }

  if (!address.house_number || typeof address.house_number !== 'string' || address.house_number.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "House number is required"
    });
  }

  req.orderData = orderData;
  
  next();
}

/**
 * validation for order ID in params
 */
function validateOrderId(req, res, next) {
  const orderId = parseInt(req.params.orderId);
  
  if (isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID"
    });
  }

  req.orderId = orderId;
  next();
}

/**
 * validation for payment data in order creation
 */
function validatePaymentData(req, res, next) {
  const { paymentData } = req.body;

  if (!paymentData) {
    return res.status(400).json({
      success: false,
      message: "Payment data is required"
    });
  }

  // check useSavedCard exists and is boolean
  if (typeof paymentData.useSavedCard !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: "useSavedCard field is required and must be boolean"
    });
  }

  if (paymentData.useSavedCard === false) {
    if (!paymentData.paymentMethodId || typeof paymentData.paymentMethodId !== 'string') {
      return res.status(400).json({
        success: false,
        message: "paymentMethodId is required for new card payments"
      });
    }

    // check paymentMethodId format (basic check)
    if (!paymentData.paymentMethodId.startsWith('pm_')) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method ID format"
      });
    }

    // check saveNewCard exists and is boolean
    if (typeof paymentData.saveNewCard !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "saveNewCard field must be boolean"
      });
    }
  }

  req.paymentData = paymentData;

  next();
}


module.exports = {
  validateOrderCreation,
  validateOrderId,
  validatePaymentData
};