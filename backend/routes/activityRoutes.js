const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getActivity } = require("../controllers/activityController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getActivity);

module.exports = router;
