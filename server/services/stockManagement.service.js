const stockManagmentController = require('../controllers/stockManagement.controller');

// ===== categories =====
async function getAllCategories() {
  try {
    const categories = await stockManagmentController.getAllCategories();
    return { code: 200, data: categories };
  } catch (error) {
    console.error('ERROR IN getAllCategories service:', error);
    return { code: 500, msg: error.message || 'Failed to get categories' };
  }
}

async function createCategory(data) {
  try {
    const category = await stockManagmentController.createCategory(data);
    return { code: 200, data: category };
  } catch (error) {
    console.error('ERROR IN createCategory service:', error);
    return { code: 500, msg: error.message || 'Failed to create category' };
  }
}

async function updateCategory(id, data) {
  try {
    const category = await stockManagmentController.updateCategory(id, data);
    return { code: 200, data: category };
  } catch (error) {
    console.error('ERROR IN updateCategory service:', error);
    return { code: 500, msg: error.message || 'Failed to update category' };
  }
}

async function deleteCategory(id) {
  try {
    await stockManagmentController.deleteCategory(id);
    return { code: 200, msg: 'Category deleted successfully' };
  } catch (error) {
    console.error('ERROR IN deleteCategory service:', error);
    return { code: 500, msg: error.message || 'Failed to delete category' };
  }
}

// ===== books =====
async function getBooksByCategory(categoryId) {
  try {
    const books = await stockManagmentController.getBooksByCategory(categoryId);
    return { code: 200, data: books };
  } catch (error) {
    console.error('ERROR IN getBooksByCategory service:', error);
    return { code: 500, msg: error.message || 'Failed to get books' };
  }
}

async function createBook(data) {
  try {
    const book = await stockManagmentController.createBook(data);
    return { code: 200, data: book };
  } catch (error) {
    console.error('ERROR IN createBook service:', error);
    return { code: 500, msg: error.message || 'Failed to create book' };
  }
}

async function updateBook(id, data) {
  try {
    const book = await stockManagmentController.updateBook(id, data);
    return { code: 200, data: book };
  } catch (error) {
    console.error('ERROR IN updateBook service:', error);
    return { code: 500, msg: error.message || 'Failed to update book' };
  }
}

async function deleteBook(id) {
  try {
    await stockManagmentController.deleteBook(id);
    return { code: 200, msg: 'Book deleted successfully' };
  } catch (error) {
    console.error('ERROR IN deleteBook service:', error);
    return { code: 500, msg: error.message || 'Failed to delete book' };
  }
}

async function getBooksByCategoryWithPagination(options) {
  try {
    const result = await stockManagmentController.getBooksByCategoryWithPagination(options);
    
    return { code: 200, data: result};
  } catch (error) {
    console.error('ERROR IN getBooksByCategoryWithPagination service:', error);
    return { code: 500, msg: error.message || "Failed to retrieve books" 
    };
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
