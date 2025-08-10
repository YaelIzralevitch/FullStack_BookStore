/**
 * ולידציה לעדכון פרטי משתמש
 */
function validateUserUpdate(req, res, next) {
  const updateData = req.body;

  // בדיקה שיש נתונים לעדכן
  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "No data provided for update" 
    });
  }

  // רשימת שדות מותרים
  const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'city', 'street', 'house_number'];
  const providedFields = Object.keys(updateData);

  // בדיקה שכל השדות שסופקו מותרים
  const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid fields: ${invalidFields.join(', ')}` 
    });
  }

  // ולידציה של שם פרטי
  if (updateData.first_name !== undefined) {
    if (!updateData.first_name || updateData.first_name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "First name cannot be empty" 
      });
    }
  }

  // ולידציה של שם משפחה
  if (updateData.last_name !== undefined) {
    if (!updateData.last_name || updateData.last_name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Last name cannot be empty" 
      });
    }
  }

  // ולידציה של אימייל
  if (updateData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!updateData.email || !emailRegex.test(updateData.email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }
  }

  // ולידציה של טלפון
  if (updateData.phone !== undefined) {
    if (updateData.phone && !/^[\d\-\+\(\)\s]{7,20}$/.test(updateData.phone)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid phone number format" 
      });
    }
  }

  next();
}


module.exports = {
  validateUserUpdate
};