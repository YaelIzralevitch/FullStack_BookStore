/**
 * ולידציה ליצירת או עדכון ספר
 */
function validateBookData(req, res, next) {
  const book = req.body;

  console.log('Validating book data:', book);
  if (!book || typeof book !== 'object') {
    return res.status(400).json({
      success: false,
      message: "Book data is required"
    });
  }

  // --- בדיקת קטגוריה
  if (!book.category_id || typeof book.category_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: "Category ID is required and must be a number"
    });
  }

  // --- בדיקת שם הספר
  if (!book.title || typeof book.title !== 'string' || book.title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }

  // --- בדיקת המחבר
  if (!book.author || typeof book.author !== 'string' || book.author.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Author is required"
    });
  }

  // --- בדיקת תיאור (אפשר להשאיר ריק אם רוצים)
  if (book.description && typeof book.description !== 'string') {
    return res.status(400).json({
      success: false,
      message: "Description must be a string"
    });
  }

  // --- בדיקת מחיר
  if (book.price === undefined || typeof book.price !== 'number' || book.price < 0) {
    return res.status(400).json({
      success: false,
      message: "Price is required and must be a non-negative number"
    });
  }

  // --- בדיקת כמות במלאי
  if (book.stock_quantity === undefined || typeof book.stock_quantity !== 'number' || book.stock_quantity < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock quantity is required and must be a non-negative number"
    });
  }

  // --- אם הכל תקין, מוסיפים ל־req
  req.book = book;
  next();
}


function validateCategoryData(req, res, next) {
  const category = req.body;

  if (!category || typeof category !== 'object') {
    return res.status(400).json({
      success: false,
      message: "Category data is required"
    });
  }

  if (!category.name || typeof category.name !== 'string' || category.name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Category name is required"
    });
  }

  req.category = category;
  next();
}

module.exports = {
  validateBookData,
  validateCategoryData
};
