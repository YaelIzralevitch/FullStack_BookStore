const cardsController = require("../controllers/cards.Controller");
const usersController = require("../controllers/users.controller");

/**
 * קבלת פרטי כרטיס אשראי
 */
async function getUserSavedCard(userId) {
  try {
    const creditCard = await cardsController.getUserSavedCard(userId);

    return {
      code: 200,
      data: creditCard // יהיה null אם לא נמצא כרטיס
    };
  } catch (error) {
    console.error('ERROR IN getUserCreditCard service:', error);
    return { code: 500, msg: error.message || "Failed to retrieve credit card" };
  }
}

/**
 * הוספת כרטיס אשראי
 */
async function saveUserCreditCard(userId, paymentMethodId ) {
  try {

    const user = await usersController.getUserById(userId);
    const userEmail = user.email; 

    await cardsController.saveCard(userId, userEmail, paymentMethodId);

    return { code: 200 };
  } catch (error) {
    console.error('ERROR IN saveUserCreditCard service:', error);
    return { code: 500, msg: error.message || "Failed to add credit card" };
  }
}

/**
 * מחיקת כרטיס אשראי
 */
async function deleteUserCreditCard(userId) {
  try {

    await cardsController.deleteUserCard(userId);

    return { code: 200 };
  } catch (error) {
    console.error('ERROR IN deleteUserCreditCard service:', error);
    return { code: 500, msg: error.message || "Failed to delete credit card" };
  }
}

module.exports = {
  getUserSavedCard,
  saveUserCreditCard,
  deleteUserCreditCard,
};