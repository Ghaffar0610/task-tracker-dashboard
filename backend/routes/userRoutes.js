const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const {
  getMe,
  updateMe,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  getRecoveryCodeStatus,
  regenerateRecoveryCodes,
  getReferrals,
} = require("../controllers/userController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    cb(isImage ? null : new Error("Only image files are allowed."), isImage);
  },
});

router.use(authMiddleware);

router.get("/me", getMe);
// JSON updates (theme/workspace/etc) without multipart parsing.
router.patch("/me", updateMe);
router.put("/me", upload.single("avatar"), updateMe);
router.put("/me/password", changePassword);
router.get("/me/referrals", getReferrals);
router.get("/me/notification-preferences", getNotificationPreferences);
router.put("/me/notification-preferences", updateNotificationPreferences);
router.get("/me/recovery-codes/status", getRecoveryCodeStatus);
router.post("/me/recovery-codes/regenerate", regenerateRecoveryCodes);

module.exports = router;
