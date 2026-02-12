const User = require("../models/User");
const { generateRecoveryCodes } = require("../services/recoveryCodeService");
const notificationTypes = [
  "task_created",
  "task_updated",
  "task_completed",
  "task_deleted",
];

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "name email avatarUrl emailNotificationsEnabled emailNotificationTypes"
  );
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
    const encoded = req.file.buffer.toString("base64");
    updates.avatarUrl = `data:${req.file.mimetype};base64,${encoded}`;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select("name email avatarUrl emailNotificationsEnabled emailNotificationTypes");

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

const getNotificationPreferences = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "emailNotificationsEnabled emailNotificationTypes"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json({
    emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
    emailNotificationTypes:
      user.emailNotificationTypes && user.emailNotificationTypes.length > 0
        ? user.emailNotificationTypes
        : notificationTypes,
  });
};

const updateNotificationPreferences = async (req, res) => {
  const { emailNotificationsEnabled, emailNotificationTypes } = req.body;

  const updates = {};
  if (emailNotificationsEnabled !== undefined) {
    updates.emailNotificationsEnabled = Boolean(emailNotificationsEnabled);
  }

  if (emailNotificationTypes !== undefined) {
    if (!Array.isArray(emailNotificationTypes)) {
      return res
        .status(400)
        .json({ message: "emailNotificationTypes must be an array." });
    }
    const hasInvalid = emailNotificationTypes.some(
      (type) => !notificationTypes.includes(type)
    );
    if (hasInvalid) {
      return res.status(400).json({ message: "Invalid notification type." });
    }
    updates.emailNotificationTypes = emailNotificationTypes;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select("emailNotificationsEnabled emailNotificationTypes");

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.status(200).json({
    emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
    emailNotificationTypes:
      user.emailNotificationTypes && user.emailNotificationTypes.length > 0
        ? user.emailNotificationTypes
        : notificationTypes,
  });
};

const getRecoveryCodeStatus = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "+recoveryCodes recoveryCodesGeneratedAt"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const total = (user.recoveryCodes || []).length;
  const remaining = (user.recoveryCodes || []).filter((entry) => !entry.usedAt)
    .length;

  return res.status(200).json({
    hasRecoveryCodes: total > 0,
    total,
    remaining,
    generatedAt: user.recoveryCodesGeneratedAt || null,
  });
};

const regenerateRecoveryCodes = async (req, res) => {
  const user = await User.findById(req.user.id).select("+recoveryCodes");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const { plainCodes, hashedCodes } = generateRecoveryCodes();
  user.recoveryCodes = hashedCodes;
  user.recoveryCodesGeneratedAt = new Date();
  await user.save();

  return res.status(200).json({
    recoveryCodes: plainCodes,
    generatedAt: user.recoveryCodesGeneratedAt,
  });
};

module.exports = {
  getMe,
  updateMe,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  getRecoveryCodeStatus,
  regenerateRecoveryCodes,
};
