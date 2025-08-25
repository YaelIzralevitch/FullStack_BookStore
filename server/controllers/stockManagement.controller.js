const pool = require('../config/db');

// ===== categories =====
async function getAllCategories() {
  try {
    const [rows] = await pool.query(`SELECT * FROM categories`);
    return rows;
  } catch (err) {
    console.error('Error in getAllCategories:', err);
    throw err;
  }
}

async function createCategory(data) {
  try {
    const { name, image_url } = data;
    const [result] = await pool.query(
      `INSERT INTO categories (name, image_url) VALUES (?, ?)`,
      [name, image_url]
    );
    return { id: result.insertId, name, image_url };
  } catch (err) {
    console.error('Error in createCategory:', err);
    throw err;
  }
}

async function updateCategory(id, data) {
  try {
    const { name, image_url } = data;
    await pool.query(
      `UPDATE categories SET name = ?, image_url = ? WHERE id = ?`,
      [name, image_url, id]
    );
    return { id, name, image_url };
  } catch (err) {
    console.error('Error in updateCategory:', err);
    throw err;
  }
}

async function deleteCategory(id) {
  try {
    await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);
  } catch (err) {
    console.error('Error in deleteCategory:', err);
    throw err;
  }
}

// ===== books =====
async function getBooksByCategory(categoryId) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, author, description, price, stock_quantity, image_url, category_id 
       FROM books 
       WHERE category_id = ?`,
      [categoryId]
    );
    return rows;
  } catch (err) {
    console.error('Error in getBooksByCategory:', err);
    throw err;
  }
}

async function getBooksByCategoryWithPagination(options = {}) {
  try {
    const {
      categoryId,
      search = '',
      sortBy = 'title',
      sortOrder = 'ASC',
      page = 1,
      limit = 10
    } = options;

    let whereClause = 'WHERE b.category_id = ?';
    const queryParams = [categoryId];

    // search by title or author
    if (search) {
      whereClause += ` AND (b.title LIKE ? OR b.author LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // offset for pagination
    const offset = (page - 1) * limit;

    const [books] = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.price,
        b.stock_quantity,
        b.description,
        b.image_url,
        b.category_id,
        c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder}
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
      categoryId: categoryId
    };
  } catch (error) {
    console.error('ERROR IN getBooksByCategory:', error);
    throw error;
  }
}


async function createBook(data) {
  try {
    const { title, author, description, price, stock_quantity, image_url, category_id } = data;
    const [result] = await pool.query(
      `INSERT INTO books (title, author, description, price, stock_quantity, image_url, category_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, author, description, price, stock_quantity, image_url, category_id]
    );
    return { id: result.insertId, ...data };
  } catch (err) {
    console.error('Error in createBook:', err);
    throw err;
  }
}

async function updateBook(id, data) {
  try {
    const { title, author, description, price, stock_quantity, image_url, category_id } = data;
    await pool.query(
      `UPDATE books SET title = ?, author = ?, description = ?, price = ?, stock_quantity = ?, image_url = ?, category_id = ? WHERE id = ?`,
      [title, author, description, price, stock_quantity, image_url, category_id, id]
    );
    return { id, ...data };
  } catch (err) {
    console.error('Error in updateBook:', err);
    throw err;
  }
}

async function deleteBook(id) {
  try {
    await pool.query(`DELETE FROM books WHERE id = ?`, [id]);
  } catch (err) {
    console.error('Error in deleteBook:', err);
    throw err;
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBooksByCategory,
  createBook,
  updateBook,
  deleteBook,
  getBooksByCategoryWithPagination
};
