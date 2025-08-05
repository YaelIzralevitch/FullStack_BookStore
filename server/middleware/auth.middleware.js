const jwt = require('jsonwebtoken');
const SECRET = 'MySecretKey';

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch {
    res.sendStatus(403);
  }
}

module.exports = auth;
