const express = require("express");
const authMiddleware = require("../middleware/auth");
const { startFocus, stopFocus, getSummary } = require("../controllers/focusController");

const router = express.Router();

router.use(authMiddleware);

router.post("/start", startFocus);
router.post("/stop", stopFocus);
router.get("/summary", getSummary);

module.exports = router;
