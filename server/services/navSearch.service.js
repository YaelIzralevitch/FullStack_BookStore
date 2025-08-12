const searchController = require('../controllers/navSearch.controller');

async function searchBooksAndCategories(searchTerm) {
  try {
    const results = await searchController.searchBooksAndCategories(searchTerm);
    return {
      code: 200,
      data: results
    };
  } catch (error) {
    console.error('ERROR IN searchBooksAndCategories service:', error);
    return { code: 500, msg: error.message || "Failed to search books and categories" };
  }
}

module.exports = {
  searchBooksAndCategories
};
