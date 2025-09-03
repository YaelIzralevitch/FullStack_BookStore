/**
 * validation middleware for book and category data
 */
function validateBookData(req, res, next) {
  const book = req.body;
  if (!book || typeof book !== 'object') {
    return res.status(400).json({
      success: false,
      message: "Book data is required"
    });
  }

  // check category
  if (!book.category_id || typeof book.category_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: "Category ID is required and must be a number"
    });
  }

  // check title
  if (!book.title || typeof book.title !== 'string' || book.title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }

  // check author
  if (!book.author || typeof book.author !== 'string' || book.author.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Author is required"
    });
  }

  // check description (optional)
  if (book.description && typeof book.description !== 'string') {
    return res.status(400).json({
      success: false,
      message: "Description must be a string"
    });
  }

  // check price
  if (book.price === undefined || typeof book.price !== 'number' || book.price < 0) {
    return res.status(400).json({
      success: false,
      message: "Price is required and must be a non-negative number"
    });
  }

  // check stock_quantity
  if (book.stock_quantity === undefined || typeof book.stock_quantity !== 'number' || book.stock_quantity < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock quantity is required and must be a non-negative number"
    });
  }

  req.book = book;
  next();
}

function validateBookUpdate(req, res, next) {
  const updateData = req.body;

  
  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No data provided for update"
    });
  }
  
  
  // allowed fields for update
  const allowedFields = [
    'title',
    'author',
    'description',
    'price',
    'stock_quantity',
    'image_url',
    'category_id'
  ];
  const providedFields = Object.keys(updateData);


  // check for invalid fields
  const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid fields: ${invalidFields.join(', ')}`
    });
  }

  // check only the fields that were provided
  if (updateData.title !== undefined) {
    if (typeof updateData.title !== 'string' || updateData.title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty"
      });
    }
  }

  if (updateData.author !== undefined) {
    if (typeof updateData.author !== 'string' || updateData.author.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Author cannot be empty"
      });
    }
  }

  if (updateData.description !== undefined) {
    if (typeof updateData.description !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Description must be a string"
      });
    }
  }

  if (updateData.price !== undefined) {
    if (typeof updateData.price !== 'number' || updateData.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number"
      });
    }
  }

  if (updateData.stock_quantity !== undefined) {
    if (typeof updateData.stock_quantity !== 'number' || updateData.stock_quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative number"
      });
    }
  }

  if (updateData.category_id !== undefined) {
    if (typeof updateData.category_id !== 'number') {
      return res.status(400).json({
        success: false,
        message: "Category ID must be a number"
      });
    }
  }

  
  req.bookUpdate = updateData;
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
  validateBookUpdate,
  validateCategoryData
};
