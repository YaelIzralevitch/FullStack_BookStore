const pool = require("../config/db");

async function getUserById(userId) {
  try {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, phone, city, street, house_number, role FROM users WHERE id = ?',
      [userId]
    );
    const user = rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (err) {
    console.error('ERROR IN getUserById:', err);
    throw err;
  }
}

/**
 * update user details
 */
async function updateUserDetails(userId, updateData) {
  try {
    const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'city', 'street', 'house_number'];
    const fieldsToUpdate = [];
    const values = [];

    // validate and prepare fields for update
    Object.keys(updateData).forEach(field => {
      if (allowedFields.includes(field)) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    });

    if (fieldsToUpdate.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId); // add userId for WHERE clause

    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    
    const [result] = await pool.query(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

  } catch (err) {
    console.error('ERROR IN updateUserDetails:', err);
    throw err;
  }
}

module.exports = {
  updateUserDetails,
  getUserById
};