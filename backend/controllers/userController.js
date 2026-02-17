const User = require("../models/User");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const AccountEvent = require("../models/AccountEvent");
const { generateRecoveryCodes } = require("../services/recoveryCodeService");
const { ensureUserHasReferralCode } = require("../services/referralService");
const notificationTypes = [
  "task_created",
  "task_updated",
  "task_completed",
  "task_deleted",
];

const toUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "member",
  isActive: user.isActive !== false,
  mustChangePassword: Boolean(user.mustChangePassword),
  avatarUrl: user.avatarUrl || "",
  uiTheme: user.uiTheme || "system",
  workspaceName: user.workspaceName || "",
  workspaceDefaultRole: user.workspaceDefaultRole || "member",
  referralCode: user.referralCode || "",
  referralPoints: user.referralPoints || 0,
  referralsCount: user.referralsCount || 0,
  emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
  emailNotificationTypes:
    user.emailNotificationTypes && user.emailNotificationTypes.length > 0
      ? user.emailNotificationTypes
      : notificationTypes,
});

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "name email role isActive mustChangePassword avatarUrl uiTheme workspaceName workspaceDefaultRole referralCode referralPoints referralsCount emailNotificationsEnabled emailNotificationTypes"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!user.referralCode || !String(user.referralCode).trim()) {
    user.referralCode = await ensureUserHasReferralCode(user._id);
  }

  return res.status(200).json(toUserPayload(user));
};

const updateMe = async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== "string") {
      return res.status(400).json({ message: "Name must be a string." });
    }
    const nextName = req.body.name.trim();
    if (nextName) {
      updates.name = nextName;
    }
  }
  if (req.body.uiTheme !== undefined) {
    updates.uiTheme = req.body.uiTheme;
  }
  if (req.body.workspaceName !== undefined) {
    updates.workspaceName = String(req.body.workspaceName || "").trim();
  }
  if (req.body.workspaceDefaultRole !== undefined) {
    updates.workspaceDefaultRole = req.body.workspaceDefaultRole;
  }
  if (req.file) {
    const encoded = req.file.buffer.toString("base64");
    updates.avatarUrl = `data:${req.file.mimetype};base64,${encoded}`;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select(
    "name email role isActive mustChangePassword avatarUrl uiTheme workspaceName workspaceDefaultRole referralCode referralPoints referralsCount emailNotificationsEnabled emailNotificationTypes"
  );

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.status(200).json(toUserPayload(user));
};

const getReferrals = async (req, res) => {
  const members = await User.find({ referredBy: req.user.id })
    .select("name email createdAt")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    members.map((member) => ({
      id: member._id,
      name: member.name,
      email: member.email,
      createdAt: member.createdAt,
    }))
  );
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

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid current password." });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.mustChangePassword = false;
  user.passwordUpdatedAt = new Date();
  user.passwordResetByAdmin = null;
  user.passwordResetAt = null;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
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
    if (typeof emailNotificationsEnabled !== "boolean") {
      return res.status(400).json({
        message: "emailNotificationsEnabled must be a boolean.",
      });
    }
    updates.emailNotificationsEnabled = emailNotificationsEnabled;
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

const getMyAccountEvents = async (req, res) => {
  const unreadOnly = req.query.unread === "true";
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 20);

  const filter = { userId: req.user.id };
  if (unreadOnly) {
    filter.isRead = false;
  }

  const items = await AccountEvent.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  return res.status(200).json({ items });
};

const markAccountEventRead = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid account event id." });
  }

  const item = await AccountEvent.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Account event not found." });
  }

  return res.status(200).json(item);
};

const generateTemporaryPassword = (length = 12) => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    const idx = crypto.randomInt(0, chars.length);
    password += chars[idx];
  }
  return password;
};

const adminResetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { temporaryPassword } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  if (temporaryPassword !== undefined && typeof temporaryPassword !== "string") {
    return res.status(400).json({ message: "temporaryPassword must be a string." });
  }

  const nextTemporaryPassword =
    temporaryPassword && temporaryPassword.trim()
      ? temporaryPassword.trim()
      : generateTemporaryPassword();

  if (nextTemporaryPassword.length < 8) {
    return res.status(400).json({
      message: "Temporary password must be at least 8 characters.",
    });
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return res.status(404).json({ message: "User not found." });
  }

  targetUser.password = await bcrypt.hash(nextTemporaryPassword, 10);
  targetUser.mustChangePassword = true;
  targetUser.passwordUpdatedAt = new Date();
  targetUser.passwordResetByAdmin = req.user.id;
  targetUser.passwordResetAt = new Date();
  await targetUser.save();

  return res.status(200).json({
    message: "Temporary password set. User must change password on next login.",
    temporaryPassword: nextTemporaryPassword,
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
  getReferrals,
  adminResetUserPassword,
  getMyAccountEvents,
  markAccountEventRead,
};
