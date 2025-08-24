/**
 * ולידציה לכרטיס אשראי חדש
 */
function validateCreditCardAdd(req, res, next) {
  const { paymentMethodId } = req.body;

  if (!paymentMethodId || typeof paymentMethodId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid or missing paymentMethodId'
    });
  }

  next();
}


module.exports = {
  validateCreditCardAdd
};
