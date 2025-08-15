/**
 * ולידציה ליצירת הזמנה
 */
function validateYear(req, res, next) {
  const year = req.query.year || new Date().getFullYear();

  const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > new Date().getFullYear() + 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter"
      });
    }

  // קריאה ל-middleware של ולידציית תשלום
  req.year = yearNum;
  
  next();
}

module.exports = {
  validateYear
};