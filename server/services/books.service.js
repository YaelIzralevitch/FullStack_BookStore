const booksController = require('../controllers/books.controller');

async function getBooksByCategory(categoryId) {
  try {
    const books = await booksController.getAllBooksByCategoryId(categoryId);
    return { code: 200, data: books };
  } catch (error) {
    console.error('ERROR IN getBooksByCategory service:', error);
    return { code: 500, msg: error.message || "Failed to retrieve books by category" };
  }
}

async function getBookById(bookId) {
  try {
    const book = await booksController.getBookById(bookId);
    return { code: 200, data: book };
  } catch (error) {
    console.error('ERROR IN getBookById service:', error);
    return { code: 500, msg: error.message || "Failed to retrieve book by ID" };
  }
}

async function getBooksByCategoryWithPagination(options) {
  try {
    console.log('Options received in books service:', options);
    const result = await booksController.getBooksByCategoryWithPagination(options);
    console.log('Result from books controller:', result);
    
    return { code: 200, data: result };
  } catch (error) {
    console.error('ERROR IN getBooksByCategoryWithPagination books service:', error);
    return { 
      code: 500, 
      msg: error.message || "Failed to retrieve books" 
    };
  }
}

module.exports = {
  getBooksByCategory,
  getBookById,
  getBooksByCategoryWithPagination
};
