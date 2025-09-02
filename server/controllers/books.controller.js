const pool = require('../config/db');

async function getAllBooksByCategoryId(categoryId) {
  try {
    const [rows] = await pool.query(
    `SELECT id, title, author, price, stock_quantity, image_url, category_id, description
    FROM books 
    WHERE category_id = ?`,
    [categoryId]
    );
    return rows;
  } catch (err) {
    console.error('ERROR IN getAllBooksByCategoryId:', err);
    throw err;
  }
}


async function getBookById(bookId) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, author, price, stock_quantity, image_url, description, category_id 
       FROM books 
       WHERE id = ?`,
      [bookId]
    );
    return rows[0];  
  } catch (err) {
    console.error('ERROR IN getBookById:', err);
    throw err;
  }
}

async function getBooksByCategoryWithPagination(options = {}) {
  try {
    const {
      categoryId,
      sortBy = '',
      sortOrder = 'ASC',
      page = 1,
      limit = 10
    } = options;

    let whereClause = 'WHERE b.category_id = ?';
    const queryParams = [categoryId];

    // offset for pagination
    const offset = (page - 1) * limit;

    // Build the ORDER BY clause based on sortBy - if there is no sortBy, we will not add a sort
    let orderByClause = '';
    if (sortBy === 'title') {
      orderByClause = `ORDER BY b.title ${sortOrder}`;
    } else if (sortBy === 'price') {
      orderByClause = `ORDER BY b.price ${sortOrder}`;
    }
    //If sortBy is empty or unknown, we will not add ORDER BY (natural sorting of the table)

    const [books] = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.price,
        b.stock_quantity,
        b.description,
        b.image_url,
        c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // total count for pagination
    const [[totalCount]] = await pool.query(`
      SELECT COUNT(*) as total
      FROM books b
      ${whereClause}
    `, queryParams);

    return {
      books: books,
      totalCount: totalCount.total,
      currentPage: page,
      totalPages: Math.ceil(totalCount.total / limit),
    };
  } catch (error) {
    console.error('ERROR IN getBooksByCategoryWithPagination books controller:', error);
    throw error;
  }
}

module.exports = {
  getAllBooksByCategoryId,
  getBookById,
  getBooksByCategoryWithPagination
};
