const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const { validateRegister, validateLogin } = require("../middleware/auth.validation");

// register משתמש רגיל
router.post("/register", validateRegister, async (req, res) => {
  try {
    await authService.register(req.body);
    res.send({ success: true, message: "Registered" });
  } catch (e) {
    res.status(500).send({ success: false, message: e.message });
  }
});

// login (בודק גם users וגם admins!)
router.post("/login", validateLogin, async (req, res) => {
  try {
    const result = await authService.login(req.body);
    if (result.code !== 200)
      return res.status(result.code).send({ success:false, message: result.msg, user: result.user });

    res.cookie('token', result.token, {
      httpOnly: true,
      maxAge: 24*60*60*1000
    });
    res.send({ success: true, message: "Logged in" });
  } catch (e) {
    res.status(500).send({ success: false, message: e.message});
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send({ success: true, message: "Logged out" });
});

module.exports = router;
