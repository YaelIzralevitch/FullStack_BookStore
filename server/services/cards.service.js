const cardsController = require("../controllers/cards.Controller");
const usersController = require("../controllers/users.controller");

/**
 * retrieve user's saved credit card
 */
async function getUserSavedCard(userId) {
  try {
    const creditCard = await cardsController.getUserSavedCard(userId);

    return {
      code: 200,
      data: creditCard // if no card, will be null
    };
  } catch (error) {
    console.error('ERROR IN getUserCreditCard service:', error);
    return { code: 500, msg: error.message || "Failed to retrieve credit card" };
  }
}

/**
 * add a credit card for user
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
 * delete user's saved credit card
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