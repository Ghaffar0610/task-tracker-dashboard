const User = require("../models/User");

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("name email avatarUrl");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json(user);
};

const updateMe = async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) {
    const nextName = req.body.name.trim();
    if (nextName) {
      updates.name = nextName;
    }
  }
  if (req.file) {
    updates.avatarUrl = `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select("name email avatarUrl");

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.status(200).json(user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new password are required." });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const bcrypt = require("bcryptjs");
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid current password." });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.status(200).json({ message: "Password updated." });
};

module.exports = { getMe, updateMe, changePassword };
