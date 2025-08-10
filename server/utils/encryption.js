const crypto = require('crypto');

// מפתח סודי לקידוד - בפרודקשן צריך להיות ב-.env
const ENCRYPTION_KEY = process.env.CREDIT_CARD_KEY || '12345678901234567890123456789012'; // 32 bytes
const ALGORITHM = 'aes-256-cbc';

// קידוד פרטי כרטיס אשראי
function encryptCreditCard(creditCardData) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(JSON.stringify(creditCardData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('ERROR IN encryptCreditCard:', error);
    throw new Error('Failed to encrypt credit card data');
  }
}

// פיענוח פרטי כרטיס אשראי
function decryptCreditCard(encryptedData) {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('ERROR IN decryptCreditCard:', error);
    throw new Error('Failed to decrypt credit card data');
  }
}

module.exports = {
  encryptCreditCard,
  decryptCreditCard
};