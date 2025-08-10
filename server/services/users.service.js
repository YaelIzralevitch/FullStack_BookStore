const usersController = require("../controllers/users.Controller");

/**
 * קבלת פרטי משתמש
 */
async function getUserById(userId) {
  try {

    const user = await usersController.getUserById(userId);

    return {
      code: 200,
      data: user
    };
  } catch (error) {
    console.error('ERROR IN getUserById service:', error);
    return { code: 500, msg: error.message || "Failed to retrieve user" };
  }
}

/**
 * עדכון פרטי משתמש
 */
async function updateUserDetails(userId, updateData) {
  try {
    const updatedUser = await usersController.updateUserDetails(userId, updateData);
    
    return {
      code: 200,
      data: updatedUser,
      msg: "User details updated successfully"
    };
  } catch (error) {
    console.error('ERROR IN updateUserDetails service:', error);
    
    // טיפול בשגיאות ספציפיות
    if (error.message === 'User not found') {
      return { code: 404, msg: "User not found" };
    }
    
    if (error.message.includes('Duplicate entry') && error.message.includes('email')) {
      return { code: 409, msg: "Email already exists" };
    }
    
    return { code: 500, msg: error.message || "Failed to update user details" };
  }
}

module.exports = {
  updateUserDetails,
  getUserById,
};
