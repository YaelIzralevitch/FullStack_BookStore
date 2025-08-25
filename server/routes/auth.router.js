const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const { validateRegister, validateLogin } = require("../middleware/auth.validation");

// register regular user
router.post("/register", validateRegister, async (req, res) => {
  try {
    await authService.register(req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// login - check user and admin
router.post("/login", validateLogin, async (req, res) => {
  try {
    const result = await authService.login(req.body);
    if (result.code !== 200)
      return res.status(result.code).json({ success:false, message: result.msg });

   res.json({ 
      success: true, 
      user: result.user,
      token: result.token 
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message});
  }
});

module.exports = router;
