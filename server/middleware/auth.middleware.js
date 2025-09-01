const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // retrieve token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }

  try {
    const decoded  = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

// check if user is admin
function requireAdmin(req, res, next) {
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

function authorizeOwner(req, res, next) {
  
  const requestedUserId = parseInt(req.params.userId);
  const currentUserId = req.user.id; // from token
  
  if (currentUserId !== requestedUserId) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
}

module.exports = { 
    authenticate, 
    requireAdmin,
    authorizeOwner
};