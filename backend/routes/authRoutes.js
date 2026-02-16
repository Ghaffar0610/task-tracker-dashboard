const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  register,
  login,
  resetPasswordWithRecoveryCode,
  changeTempPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password/recovery-code", resetPasswordWithRecoveryCode);
router.post("/change-temp-password", authMiddleware, changeTempPassword);

module.exports = router;
