const express = require("express");
const {
  register,
  login,
  resetPasswordWithRecoveryCode,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password/recovery-code", resetPasswordWithRecoveryCode);

module.exports = router;
