const pool = require('../config/db');

async function searchBooksAndCategories(searchTerm) {
  try {
    const [books] = await pool.query(
      `SELECT id, title, category_id, 'book' AS type
       FROM books
       WHERE title LIKE ?
       LIMIT 5`,
      [`%${searchTerm}%`]
    );

    const [categories] = await pool.query(
      `SELECT id, name, 'category' AS type
       FROM categories
       WHERE name LIKE ?
       LIMIT 5`,
      [`%${searchTerm}%`]
    );

    return [...books, ...categories];
  } catch (err) {
    console.error('ERROR IN searchBooksAndCategories:', err);
    throw err;
  }
}

module.exports = {
  searchBooksAndCategories
};
