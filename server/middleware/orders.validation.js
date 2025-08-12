const { validateCardDetails } = require('./cards.validation.js');
/**
 * ולידציה ליצירת הזמנה
 */
function validateOrderCreation(req, res, next) {
  const { orderData, paymentData } = req.body;

  // בדיקת נתוני הזמנה
  if (!orderData) {
    return res.status(400).json({
      success: false,
      message: "Order data is required"
    });
  }

  // בדיקת פריטים בהזמנה
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order must contain at least one item"
    });
  }

  // בדיקת תקינות כל פריט
  for (let i = 0; i < orderData.items.length; i++) {
    const item = orderData.items[i];
    
    if (!item.bookId || typeof item.bookId !== 'number') {
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

  // בדיקת מחיר כולל
  if (!orderData.totalPrice || typeof orderData.totalPrice !== 'number' || orderData.totalPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid total price. Must be a positive number"
    });
  }

  // חישוב ובדיקת תקינות המחיר הכולל
  const calculatedTotal = orderData.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const tolerance = 0.01; // סובלנות של סנט אחד לטעויות עיגול
  if (Math.abs(calculatedTotal - orderData.totalPrice) > tolerance) {
    return res.status(400).json({
      success: false,
      message: "Total price doesn't match calculated sum of items"
    });
  }

  // בדיקת כתובת משלוח
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

  // בדיקת נתוני תשלום
  if (!paymentData) {
    return res.status(400).json({
      success: false,
      message: "Payment data is required"
    });
  }

  if (typeof paymentData.savedCard !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: "savedCard field is required and must be boolean"
    });
  }

    if (!paymentData.savedCard) {
        // תשלום עם כרטיס חדש
        const validate = validateCardDetails(paymentData.cardNumber, paymentData.cardExpairy, paymentData.cardCvv);
        if (!validate.valid) {
            return res.status(400).json({ 
                    success: false,
                    message: validate.message 
                    }); // מחזיר את התגובה במקרה של שגיאה
        }
        req.body.paymentData.cardNumber = validate.cleanCardNumber;
    }

  // קריאה ל-middleware של ולידציית תשלום
  req.orderData = orderData;
  req.paymentData = paymentData;
  
  next();
}

/**
 * ולידציה של מזהה הזמנה
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

module.exports = {
  validateOrderCreation,
  validateOrderId
};