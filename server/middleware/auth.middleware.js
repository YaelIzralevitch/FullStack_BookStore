const jwt = require('jsonwebtoken');
const SECRET = 'MySecretKey'; // כדאי להעביר ל-.env

function auth(req, res, next) {
  // קבלת הטוקן מheader Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }

  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

// middleware לבדיקת תפקיד admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

module.exports = { auth, requireAdmin };