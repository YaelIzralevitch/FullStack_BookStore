function validateRegister(req, res, next) {
  const { first_name, last_name, email, password, phone } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ 
      success: false, 
      message: "First name and last name are required" 
    });
  }

  // correct email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid or missing email" 
    });
  }

  // password at least 6 chars, letters and numbers
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({ 
      success: false, 
      message: "Password must be at least 6 characters and contain letters and numbers" 
    });
  }

  // phone number (optional) - only digits, 7 to 15 chars
  if (phone && !/^\d{7,15}$/.test(phone)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid phone number" 
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Email and password are required" 
    });
  }

  // match email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid email" 
    });
  }

  next();
}

module.exports = { validateRegister, validateLogin };