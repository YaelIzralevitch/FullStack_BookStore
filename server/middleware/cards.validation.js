

/**
 * ולידציה לכרטיס אשראי חדש (כל השדות נדרשים)
 */
function validateCreditCardAdd(req, res, next) {
  const { cardNumber, cardExpairy, cardCvv } = req.body;

  // בדיקה שכל השדות קיימים
  if (!cardNumber || !cardExpairy || !cardCvv) {
    return res.status(400).json({ 
      success: false, 
      message: "All credit card fields are required: cardNumber, cardExpairy, cardCvv" 
    });
  }

  // ולידציה של מספר כרטיס
  const cleanCardNumber = cardNumber.replace(/[\s\-]/g, ''); // הסרת רווחים וקווים
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: "Card number must be 13-19 digits" 
    });
  }

  // בדיקת Luhn algorithm (אלגוריתם לוהן) לוולידציה של מספר כרטיס
  if (!isValidCardNumber(cleanCardNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid card number" 
    });
  }

  // ולידציה של תאריך תפוגה (MM/YY)
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpairy)) {
    return res.status(400).json({ 
      success: false, 
      message: "Expiry date must be in MM/YY format" 
    });
  }

  // בדיקה שתאריך התפוגה לא עבר
  const [month, year] = cardExpairy.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();
  if (expiryDate < now) {
    return res.status(400).json({ 
      success: false, 
      message: "Card has expired" 
    });
  }

  // ולידציה של CVV
  if (!/^\d{3,4}$/.test(cardCvv)) {
    return res.status(400).json({ 
      success: false, 
      message: "CVV must be 3-4 digits" 
    });
  }

  // הוספת הנתונים הנקיים ל-request
  req.body.cardNumber = cleanCardNumber;

  next();
}


/**
 * פונקציה עזר לוולידציה של מספר כרטיס אשראי לפי אלגוריתם לוהן
 */
function isValidCardNumber(cardNumber) {
  let sum = 0;
  let shouldDouble = false;

  // עוברים על המספר מהסוף להתחלה
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
}

module.exports = {
  validateCreditCardAdd
};