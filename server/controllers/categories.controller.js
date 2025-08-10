const pool = require("../config/db");

async function getAllCategories() {
  try {
    const [rows] = await pool.query(`SELECT id, name, image_url FROM categories`);
    return rows;
  } catch (err) {
    console.error("ERROR IN getAllCategories:", err);
    throw err;
  }
}

async function getCategoryById(id) {
  try {
    const [[category]] = await pool.query(
      `SELECT id, name, image_url FROM categories WHERE id = ?`,
      [id]
    );
    return category;
  } catch (err) {
    console.error("ERROR IN getCategoryById:", err);
    throw err;
  }
}

module.exports = {
  getAllCategories,
  getCategoryById
};
