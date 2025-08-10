const cardsController = require("../controllers/cards.Controller");

/**
 * קבלת פרטי כרטיס אשראי
 */
async function getUserCreditCard(userId) {
  try {
    const creditCard = await cardsController.getUserCreditCard(userId);

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
async function addUserCreditCard(userId, creditCardData) {
  try {

    await cardsController.addUserCreditCard(userId, {
      cardNumber: creditCardData.cardNumber.replace(/\s/g, ''),
      cardExpairy: creditCardData.cardExpairy,
      cardCvv: creditCardData.cardCvv
    });

    return {
      code: 200,
      msg: "Credit card added successfully"
    };
  } catch (error) {
    console.error('ERROR IN addUserCreditCard service:', error);
    return { code: 500, msg: error.message || "Failed to add credit card" };
  }
}

/**
 * מחיקת כרטיס אשראי
 */
async function deleteUserCreditCard(userId) {
  try {

    await cardsController.deleteUserCreditCard(userId);

    return {
      code: 200,
      msg: "Credit card deleted successfully"
    };
  } catch (error) {
    console.error('ERROR IN deleteUserCreditCard service:', error);
    return { code: 500, msg: error.message || "Failed to delete credit card" };
  }
}

module.exports = {
  getUserCreditCard,
  addUserCreditCard,
  deleteUserCreditCard,
};