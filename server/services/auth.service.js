const authController = require("../controllers/auth.controller");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SECRET = "MySecretKey";

async function login({ email, password }) {
  // מחפשים משתמש רגיל
  const user = await authController.findUserByEmail(email);

  if (user) {
    // משתמש רגיל - בודקים סיסמא מ-user_passwords
    const sec = await authController.getSecurity(user.id);
    if (sec.is_locked && new Date() < new Date(sec.locked_until)) {
      return { code: 403, msg: "Account locked. Try later" };
    }

    const hash = await authController.findUserPassword(user.id);
    if (!hash) {
      return { code: 401, msg: "Invalid credentials" };
    }

    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      await authController.increaseFailOrLock(user.id, sec.failed_attempts);
      return { code: 401, msg: "Invalid credentials" };
    }

    await authController.resetSecurity(user.id);
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "24h" });
    return {
      code: 200,
      token,
      user,
      msg: "Login successfully"
    };
  }

  // לא נמצא בכלל
  return { code: 401, msg: "Invalid credentials" };
}

async function register(data) {
    await authController.createUser(data);
    return { code: 200, msg: "Registered successfully"};
}

module.exports = {
  register,
  login
};
