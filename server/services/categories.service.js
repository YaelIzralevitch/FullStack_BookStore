const categoriesController = require("../controllers/categories.controller");

async function listCategories() {
  try {
    const categories = await categoriesController.getAllCategories();
    return { code: 200, data: categories };
  } catch (error) {
    console.error('ERROR IN listCategories service:', error);
    return { code: 500, msg: error.message || "Failed to list categories" };
  }
}

async function getCategory(id) {
  try {
    const category = await categoriesController.getCategoryById(id);
    return { code: 200, data: category };
  } catch (error) {
    console.error('ERROR IN getCategory service:', error);
    return { code: 500, msg: error.message || "Failed to retrieve category" };
  }
}

module.exports = {
  listCategories,
  getCategory
};
