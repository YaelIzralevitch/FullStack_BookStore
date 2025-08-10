const pool = require("../config/db");
const { encryptCreditCard, decryptCreditCard } = require("../utils/encryption");


/**
 * קבלת פרטי כרטיס אשראי של משתמש
 */
async function getUserCreditCard(userId) {
  try {
    const [[creditCard]] = await pool.query(
      'SELECT encrypted_credit_card FROM user_credit_cards WHERE user_id = ?',
      [userId]
    );

    if (!creditCard) {
      return null; // אין כרטיס אשראי למשתמש
    }

    // פיענוח הנתונים
    const decryptedData = decryptCreditCard(creditCard.encrypted_credit_card);
    
    // החזרת נתונים בטוחים ללקוח
    return decryptedData.cardNumber.slice(-4)
  } catch (err) {
    console.error('ERROR IN getUserCreditCard:', err);
    throw err;
  }
}

/**
 * הוספת כרטיס אשראי חדש למשתמש
 */
async function addUserCreditCard(userId, creditCardData) {
  try {
    // בדיקה שכל השדות הנדרשים קיימים
    const { cardNumber, cardExpairy, cardCvv } = creditCardData;
    
    if (!cardNumber || !cardExpairy || !cardCvv) {
      throw new Error('Missing required credit card fields');
    }

    // קידוד הנתונים
    const encryptedData = encryptCreditCard(creditCardData);

    // בדיקה אם כבר יש כרטיס אשראי למשתמש
    const [[existing]] = await pool.query(
      'SELECT user_id FROM user_credit_cards WHERE user_id = ?',
      [userId]
    );

    if (existing) {
      // עדכון כרטיס קיים
      await pool.query(
        'UPDATE user_credit_cards SET encrypted_credit_card = ? WHERE user_id = ?',
        [encryptedData, userId]
      );
    } else {
      // הוספת כרטיס חדש
      await pool.query(
        'INSERT INTO user_credit_cards (user_id, encrypted_credit_card) VALUES (?, ?)',
        [userId, encryptedData]
      );
    }

    return { success: true, message: 'Credit card added successfully' };

  } catch (err) {
    console.error('ERROR IN addUserCreditCard:', err);
    throw err;
  }
}

/**
 * מחיקת כרטיס אשראי של משתמש
 */
async function deleteUserCreditCard(userId) {
  try {
    const [result] = await pool.query(
      'DELETE FROM user_credit_cards WHERE user_id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('No credit card found for this user');
    }

    return { success: true, message: 'Credit card deleted successfully' };
  } catch (err) {
    console.error('ERROR IN deleteUserCreditCard:', err);
    throw err;
  }
}

module.exports = {
  getUserCreditCard,
  addUserCreditCard,
  deleteUserCreditCard
};