const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function createUser({ first_name, last_name, phone, email, city, street, house_number, password }) {
    try {
  // הוספת משתמש לטבלת users
    const [result] = await pool.query(
        `INSERT INTO users (first_name, last_name, phone, email, city, street, house_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, phone, email, city, street, house_number]
    );
    const userId = result.insertId;

    // הוספת סיסמה לטבלת user_passwords
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
        `INSERT INTO user_passwords (user_id, password_hash) VALUES (?, ?)`,
        [userId, hashed]
  );

  // הוספת רשומה בטבלת האבטחה
  await pool.query(
    `INSERT INTO user_login_security (user_id, failed_attempts, is_locked) VALUES (?, ?, ?)`,
    [userId, 0, 0]
  );

  return userId;
} catch (err) {
    console.error('ERROR IN createUser:', err);
    throw err;
  }
}

async function findUserByEmail(email) {
  try {
    const [[user]] = await pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return user;
  } catch (err) {
    console.error('ERROR IN findUserByEmail:', err);
    throw err;
  }
}


async function findUserPassword(userId) {
    try {
  // קבלת הסיסמה המוצפנת מטבלת user_passwords לפי user_id
  const [[pwd]] = await pool.query(
    `SELECT password_hash FROM user_passwords WHERE user_id = ?`,
    [userId]
  );
  return pwd ? pwd.password_hash : null;
} catch (err) {
    console.error('ERROR IN findUserPassword:', err);
    throw err;
  }
}

async function getUserSecurity(userId) {
    try {
  const [[sec]] = await pool.query(
    `SELECT * FROM user_login_security WHERE user_id = ?`,
    [userId]
  );
  return sec;
} catch (err) {
    console.error('ERROR IN getUserSecurity:', err);
    throw err;
  }
}

async function increaseFailOrLock(userId, currentFails) {
    try {
  if (currentFails + 1 >= 3) {
    await pool.query(
      `UPDATE user_login_security SET failed_attempts=0, is_locked=1,
       locked_until=DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE user_id=?`,
      [userId]
    );
  } else {
    await pool.query(
      `UPDATE user_login_security SET failed_attempts=? WHERE user_id=?`,
      [currentFails + 1, userId]
    );
  }
} catch (err) {
    console.error('ERROR IN increaseFailOrLock:', err);
    throw err;
  }
}

async function resetSecurity(userId) {
    try {
  await pool.query(
    `UPDATE user_login_security SET failed_attempts=0, is_locked=0, locked_until=NULL WHERE user_id=?`,
    [userId]
  );
} catch (err) {
    console.error('ERROR IN resetSecurity:', err);
    throw err;
  }
}


module.exports = {
  createUser,
  findUserByEmail,
  findUserPassword,
  getUserSecurity,
  increaseFailOrLock,
  resetSecurity
};
