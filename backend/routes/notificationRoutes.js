const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);

module.exports = router;
