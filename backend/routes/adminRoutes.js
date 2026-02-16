const express = require("express");
const authMiddleware = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const {
  getOverview,
  listUsers,
  getUserDetail,
  getUserActivities,
  lockUser,
  unlockUser,
  setUserActiveState,
  changeUserRole,
  resetUserPassword,
  forceLogoutUser,
  listLoginEvents,
  listAuditLogs,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminOnly);

router.get("/overview", getOverview);
router.get("/users", listUsers);
router.get("/users/:id", getUserDetail);
router.get("/users/:id/activities", getUserActivities);
router.patch("/users/:id/lock", lockUser);
router.patch("/users/:id/unlock", unlockUser);
router.patch("/users/:id/status", setUserActiveState);
router.patch("/users/:id/role", changeUserRole);
router.post("/users/:id/reset-password", resetUserPassword);
router.post("/users/:id/force-logout", forceLogoutUser);
router.get("/login-events", listLoginEvents);
router.get("/audit-logs", listAuditLogs);

module.exports = router;
