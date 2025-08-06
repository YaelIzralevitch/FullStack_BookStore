function validateRegister(req, res, next) {
  const { first_name, last_name, email, password, phone } = req.body;

  if (!first_name || !last_name)
    return res.status(400).send("First name and last name are required");

  // מייל תקין
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return res.status(400).send("Invalid or missing email");

  // סיסמה לפחות 6 תווים + אות + מספר
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  if (!password || !passwordRegex.test(password))
    return res
      .status(400)
      .send(
        "Password must be at least 6 characters and contain letters and numbers"
      );

  // טלפון (אופציונלי) – אם קיים, שיהיה דיגיטלי בלבד
  if (phone && !/^\d{7,15}$/.test(phone))
    return res.status(400).send("Invalid phone number");

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send("Email and password are required");

  // מייל בצורתו התקינה
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).send("Invalid email");

  next();
}

module.exports = { validateRegister, validateLogin };
