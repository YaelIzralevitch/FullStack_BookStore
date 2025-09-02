const pool = require("../config/db");

/**
 * create a new order with order details
 */
async function createOrder(userId, orderData) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { items, totalPrice, shippingAddress } = orderData;

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (user_id, total_price, order_status, created_at, shippingAddress_street, shippingAddress_city, shippingAddress_house_number)
      VALUES (?, ?, 'paid', NOW(), ?, ?, ?)
      `,
      [
        userId,
        totalPrice,
        shippingAddress.street,
        shippingAddress.city,
        shippingAddress.house_number
      ]
    );

    const orderId = orderResult.insertId;

    // add order details
    for (const item of items) {
      await connection.query(
        `
        INSERT INTO order_details (order_id, book_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
        `,
        [orderId, item.id, item.quantity, item.price]
      );

      // update stock quantity (with check)
      const [updateResult] = await connection.query(
        `
        UPDATE books 
        SET stock_quantity = stock_quantity - ? 
        WHERE id = ? AND stock_quantity >= ?
        `,
        [item.quantity, item.id, item.quantity]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error(`Not enough stock for book ID ${item.id}`);
      }
    }

    await connection.commit();

    return {
      orderId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}



/**
 * get all orders for a user with details
 */
async function getUserOrders(userId) {
  try {
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

    // order details for each order
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
 * get specific order by id for a user with details
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


/**
 * get all orders with filters, sorting and pagination (for admin)
 */
async function getOrders(options = {}) {
  try {
    const {
      search = '',
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = options;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // search by order ID or user email
    if (search) {
      whereClause += ` AND (CAST(o.id AS CHAR) LIKE ? OR u.email LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // filter by order status
    if (status) {
      whereClause += ` AND o.order_status = ?`;
      queryParams.push(status);
    }

    // offset for pagination
    const offset = (page - 1) * limit;

    const [orders] = await pool.query(`
      SELECT 
        o.id as order_id,
        o.total_price,
        o.order_status,
        o.created_at,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // total count for pagination
    const [[totalCount]] = await pool.query(`
      SELECT COUNT(*) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
    `, queryParams);

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const [orderDetails] = await pool.query(`
          SELECT 
            od.quantity,
            od.unit_price,
            b.id as book_id,
            b.title,
            b.author,
            b.image_url,
            c.name as category_name
          FROM order_details od
          JOIN books b ON od.book_id = b.id
          LEFT JOIN categories c ON b.category_id = c.id
          WHERE od.order_id = ?
        `, [order.order_id]);

        return {
          ...order,
          books: orderDetails
        };
      })
    );

    return {
      orders: ordersWithDetails,
      totalCount: totalCount.total,
      currentPage: page,
      totalPages: Math.ceil(totalCount.total / limit)
    };
  } catch (error) {
    console.error('ERROR IN getOrders:', error);
    throw error;
  }
}

/**
 * update order status (for admin)
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    const validStatuses = ['paid', 'cancelled'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid order status');
    }

    const [result] = await pool.query(`
      UPDATE orders 
      SET order_status = ? 
      WHERE id = ?
    `, [newStatus, orderId]);

    if (result.affectedRows === 0) {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('ERROR IN updateOrderStatus:', error);
    throw error;
  }
}


module.exports = {
  getUserOrders,
  getOrderById, 
  createOrder,
  getOrders,
  updateOrderStatus
};