const booksController = require('../controllers/books.controller');

async function getBooksByCategory(categoryId) {
  return await booksController.getBooksByCategoryId(categoryId);
}

async function getBookById(bookId) {
  return await booksController.getBookById(bookId);
}

module.exports = {
  getBooksByCategory,
  getBookById,
};
