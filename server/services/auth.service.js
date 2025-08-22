const authController = require("../controllers/auth.controller");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SECRET = "MySecretKey";

async function login({ email, password }) {
  // מחפשים משתמש רגיל
  const user = await authController.findUserByEmail(email);

  if (user) {
    // משתמש רגיל - בודקים סיסמא מ-user_passwords
    const sec = await authController.getUserSecurity(user.id);
    if (sec.is_locked && new Date() < new Date(sec.locked_until)) {
      return { code: 403, msg: "Account locked. Try later" };
    }

    const hash = await authController.findUserPassword(user.id);
    if (!hash) {
      return { code: 401, msg: `User ${user.id} Password was not found`};
    }

    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      await authController.increaseFailOrLock(user.id, sec.failed_attempts);
      if ( sec.failed_attempts + 1 >=3 ){
        return { code: 401, msg: `Invalid Password. 3 failed attempts. Account will be blocked for 24h.` };  
      }
      return { code: 401, msg: `Invalid Password. You have ${3 - (sec.failed_attempts + 1)} more attempts left.` };
    }

    await authController.resetSecurity(user.id);
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "24h" });
    return {
      code: 200,
      token,
      user
    };
  }

  // לא נמצא בכלל
  return { code: 401, msg: `User with email ${email} does not exist` };
}

async function register(data) {
    await authController.createUser(data);
    return { code: 200 };
}

module.exports = {
  register,
  login
};
