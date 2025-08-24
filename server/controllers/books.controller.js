const pool = require('../config/db');

async function getBooksByCategoryId(categoryId) {
  try {
    const [rows] = await pool.query(
    `SELECT id, title, author, price, stock_quantity, image_url, category_id 
    FROM books 
    WHERE category_id = ?`,
    [categoryId]
    );
    return rows;
  } catch (err) {
    console.error('ERROR IN getBooksByCategoryId:', err);
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


module.exports = {
  getBooksByCategoryId,
  getBookById,
};
