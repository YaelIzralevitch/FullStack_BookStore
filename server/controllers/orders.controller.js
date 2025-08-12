const pool = require("../config/db");



/**
 * יצירת הזמנה חדשה
 */
async function createOrder(userId, orderData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { items, totalPrice, shippingAddress } = orderData;

    // יצירת הזמנה
    const [orderResult] = await connection.query(`
      INSERT INTO orders (user_id, total_price, order_status, created_at)
      VALUES (?, ?, 'pending', NOW())
    `, [userId, totalPrice]);

    const orderId = orderResult.insertId;

    // הוספת פרטי הזמנה
    for (const item of items) {
      await connection.query(`
        INSERT INTO order_details (order_id, book_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.bookId, item.quantity, item.price]);

      // עדכון מלאי (אופציונלי)
      await connection.query(`
        UPDATE books 
        SET stock_quantity = stock_quantity - ? 
        WHERE id = ? AND stock_quantity >= ?
      `, [item.quantity, item.bookId, item.quantity]);
    }

    await connection.commit();

    return {
      orderId,
      status: 'success',
      message: 'Order created successfully'
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * עיבוד תשלום (מפוברק)
 */
async function processPayment(paymentData) {
  // סימולציה של עיבוד תשלום
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% הצלחה, 5% כישלון (לצורך בדיקה)
      const success = Math.random() > 0.05;
      
      resolve({
        success,
        transactionId: success ? `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
        message: success ? 'Payment processed successfully' : 'Payment failed. Please try again.'
      });
    }, 2000); // דמוי 2 שניות עיבוד
  });
}


/**
 * קבלת כל ההזמנות של משתמש עם פרטי הספרים
 */
async function getUserOrders(userId) {
  try {
    // שאילתה לקבלת כל ההזמנות של המשתמש
    const [orders] = await pool.query(`
      SELECT 
        o.id as order_id,
        o.total_price,
        o.order_status,
        o.created_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    if (orders.length === 0) {
      return [];
    }

    // לכל הזמנה, קבל את פרטי הספרים
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const [orderDetails] = await pool.query(`
          SELECT 
            od.quantity,
            od.unit_price,
            b.id as book_id,
            b.title,
            b.author,
            b.image_url
          FROM order_details od
          JOIN books b ON od.book_id = b.id
          WHERE od.order_id = ?
        `, [order.order_id]);

        return {
          ...order,
          books: orderDetails
        };
      })
    );

    return ordersWithDetails;
  } catch (error) {
    console.error('ERROR IN getUserOrders:', error);
    throw error;
  }
}

/**
 * קבלת הזמנה בודדת עם פרטים מלאים
 */
async function getOrderById(orderId, userId) {
  try {
    const [orders] = await pool.query(`
      SELECT 
        o.id as order_id,
        o.total_price,
        o.order_status,
        o.created_at
      FROM orders o
      WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId]);

    if (orders.length === 0) {
      return null;
    }

    const order = orders[0];

    const [orderDetails] = await pool.query(`
      SELECT 
        od.quantity,
        od.unit_price,
        b.id as book_id,
        b.title,
        b.author,
        b.image_url,
        b.description,
        c.name as category_name
      FROM order_details od
      JOIN books b ON od.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE od.order_id = ?
    `, [orderId]);

    return {
      ...order,
      books: orderDetails
    };
  } catch (error) {
    console.error('ERROR IN getOrderById:', error);
    throw error;
  }
}

module.exports = {
  getUserOrders,
  getOrderById, 
  createOrder,
  processPayment
};