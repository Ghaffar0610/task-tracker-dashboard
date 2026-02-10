const express = require("express");
const path = require("path");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const { getMe, updateMe, changePassword } = require("../controllers/userController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    cb(isImage ? null : new Error("Only image files are allowed."), isImage);
  },
});

router.use(authMiddleware);

router.get("/me", getMe);
router.put("/me", upload.single("avatar"), updateMe);
router.put("/me/password", changePassword);

module.exports = router;
