const categoriesController = require("../controllers/categories.controller");

async function listCategories() {
  return await categoriesController.getAllCategories();
}

async function getCategory(id) {
  return await categoriesController.getCategoryById(id);
}

module.exports = {
  listCategories,
  getCategory
};
