const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getActivity, deleteActivity } = require("../controllers/activityController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getActivity);
router.delete("/:id", deleteActivity);

module.exports = router;
