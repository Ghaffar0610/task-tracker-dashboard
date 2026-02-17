const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const FocusSession = require("../models/FocusSession");
const LoginEvent = require("../models/LoginEvent");
const AdminAuditLog = require("../models/AdminAuditLog");
const AccountEvent = require("../models/AccountEvent");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (req) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
};

const ensureObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const logAdminAction = async ({ adminId, targetUserId = null, action, metadata = {} }) => {
  await AdminAuditLog.create({
    adminId,
    targetUserId,
    action,
    metadata,
  });
};

const createAccountEvent = async ({
  userId,
  action,
  message,
  metadata = {},
}) => {
  await AccountEvent.create({
    userId,
    action,
    message,
    metadata,
    isRead: false,
  });
};

const toUserRow = (user) => ({
  id: user._id,
  name: user.name || "",
  email: user.email,
  role: user.role || "member",
  isActive: user.isActive !== false,
  mustChangePassword: Boolean(user.mustChangePassword),
  lockedUntil: user.lockedUntil || null,
  lastLoginAt: user.lastLoginAt || null,
  failedLoginAttempts: user.failedLoginAttempts || 0,
  createdAt: user.createdAt,
});

const generateTemporaryPassword = (length = 12) => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars[crypto.randomInt(0, chars.length)];
  }
  return password;
};

const getOverview = async (req, res) => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    adminUsers,
    lockedUsers,
    totalTasks,
    totalActivities,
    totalFocusSessions,
    logins24h,
    failedLogins24h,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ lockedUntil: { $gt: now } }),
    Task.countDocuments({}),
    Activity.countDocuments({}),
    FocusSession.countDocuments({}),
    LoginEvent.countDocuments({ createdAt: { $gte: dayAgo }, success: true }),
    LoginEvent.countDocuments({ createdAt: { $gte: dayAgo }, success: false }),
  ]);

  return res.status(200).json({
    users: {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      locked: lockedUsers,
      inactive: Math.max(0, totalUsers - activeUsers),
    },
    usage: {
      tasks: totalTasks,
      activities: totalActivities,
      focusSessions: totalFocusSessions,
    },
    logins: {
      success24h: logins24h,
      failed24h: failedLogins24h,
    },
  });
};

const listUsers = async (req, res) => {
  const { q, role, status } = req.query;
  const { page, limit, skip } = parsePagination(req);
  const filter = {};

  if (typeof q === "string" && q.trim()) {
    const search = q.trim();
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    if (!["member", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role filter." });
    }
    filter.role = role;
  }

  if (status) {
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status === "locked") {
      filter.lockedUntil = { $gt: new Date() };
    } else {
      return res.status(400).json({ message: "Invalid status filter." });
    }
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select(
        "name email role isActive mustChangePassword lockedUntil lastLoginAt failedLoginAttempts createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    items: items.map(toUserRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

const getUserDetail = async (req, res) => {
  const { id } = req.params;
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const user = await User.findById(id).select(
    "name email role isActive mustChangePassword lockedUntil failedLoginAttempts lastLoginAt lastLoginIp lastLoginUserAgent createdAt"
  );
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const [taskCount, activityCount, focusCount, unreadNotificationCount] =
    await Promise.all([
      Task.countDocuments({ userId: id }),
      Activity.countDocuments({ userId: id }),
      FocusSession.countDocuments({ userId: id }),
      mongoose.model("Notification").countDocuments({ userId: id, isRead: false }),
    ]);

  return res.status(200).json({
    ...toUserRow(user),
    lastLoginIp: user.lastLoginIp || "",
    lastLoginUserAgent: user.lastLoginUserAgent || "",
    metrics: {
      tasks: taskCount,
      activities: activityCount,
      focusSessions: focusCount,
      unreadNotifications: unreadNotificationCount,
    },
  });
};

const getUserActivities = async (req, res) => {
  const { id } = req.params;
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const { page, limit, skip } = parsePagination(req);
  const [items, total] = await Promise.all([
    Activity.find({ userId: id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Activity.countDocuments({ userId: id }),
  ]);

  return res.status(200).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

const lockUser = async (req, res) => {
  const { id } = req.params;
  const minutes = Math.min(7 * 24 * 60, Math.max(1, Number(req.body?.minutes) || 60));
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const target = await User.findById(id);
  if (!target) {
    return res.status(404).json({ message: "User not found." });
  }

  target.lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
  target.failedLoginAttempts = 0;
  await target.save();

  await logAdminAction({
    adminId: req.user.id,
    targetUserId: target._id,
    action: "lock_user",
    metadata: { minutes },
  });
  await createAccountEvent({
    userId: target._id,
    action: "lock_user",
    message: `Your account was locked by admin for ${minutes} minute(s).`,
    metadata: { minutes, requiresLogout: true },
  });

  return res.status(200).json({ message: "User locked.", lockedUntil: target.lockedUntil });
};

const unlockUser = async (req, res) => {
  const { id } = req.params;
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const target = await User.findById(id);
  if (!target) {
    return res.status(404).json({ message: "User not found." });
  }

  target.lockedUntil = null;
  target.failedLoginAttempts = 0;
  await target.save();

  await logAdminAction({
    adminId: req.user.id,
    targetUserId: target._id,
    action: "unlock_user",
  });
  await createAccountEvent({
    userId: target._id,
    action: "unlock_user",
    message: "Your account lock was removed by admin.",
    metadata: { requiresLogout: false },
  });

  return res.status(200).json({ message: "User unlocked." });
};

const setUserActiveState = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body || {};
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "isActive must be a boolean." });
  }

  const target = await User.findById(id);
  if (!target) {
    return res.status(404).json({ message: "User not found." });
  }

  target.isActive = isActive;
  await target.save();

  await logAdminAction({
    adminId: req.user.id,
    targetUserId: target._id,
    action: isActive ? "activate_user" : "deactivate_user",
  });
  await createAccountEvent({
    userId: target._id,
    action: isActive ? "activate_user" : "deactivate_user",
    message: isActive
      ? "Your account was re-activated by admin."
      : "Your account was deactivated by admin.",
    metadata: { requiresLogout: !isActive },
  });

  return res.status(200).json({ message: `User ${isActive ? "activated" : "deactivated"}.` });
};

const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  if (!["member", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  const target = await User.findById(id);
  if (!target) {
    return res.status(404).json({ message: "User not found." });
  }

  const previousRole = target.role || "member";
  target.role = role;
  await target.save();

  await logAdminAction({
    adminId: req.user.id,
    targetUserId: target._id,
    action: "change_role",
    metadata: { from: previousRole, to: role },
  });
  await createAccountEvent({
    userId: target._id,
    action: "change_role",
    message: `Your account role was changed from ${previousRole} to ${role} by admin.`,
    metadata: { from: previousRole, to: role, requiresLogout: true },
  });

  return res.status(200).json({ message: "User role updated." });
};

const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { temporaryPassword } = req.body || {};
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  if (temporaryPassword !== undefined && typeof temporaryPassword !== "string") {
    return res.status(400).json({ message: "temporaryPassword must be a string." });
  }

  const nextPassword =
    temporaryPassword && temporaryPassword.trim()
      ? temporaryPassword.trim()
      : generateTemporaryPassword();
  if (nextPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "Temporary password must be at least 8 characters." });
  }

  const target = await User.findById(id);
  if (!target) {
    return res.status(404).json({ message: "User not found." });
  }

  target.password = await bcrypt.hash(nextPassword, 10);
  target.mustChangePassword = true;
  target.passwordResetByAdmin = req.user.id;
  target.passwordResetAt = new Date();
  target.passwordUpdatedAt = new Date();
  await target.save();

  await logAdminAction({
    adminId: req.user.id,
    targetUserId: target._id,
    action: "reset_password",
  });
  await createAccountEvent({
    userId: target._id,
    action: "reset_password",
    message:
      "Your password was reset by admin. Please log in with the temporary password and change it immediately.",
    metadata: { requiresLogout: true },
  });

  return res.status(200).json({
    message: "Temporary password set. User must change password on next login.",
    temporaryPassword: nextPassword,
  });
};

const forceLogoutUser = async (req, res) => {
  const { id } = req.params;
  if (!ensureObjectId(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  const target = await User.findById(id);
  if (!target) {
    return res.status(404).json({ message: "User not found." });
  }

  await logAdminAction({
    adminId: req.user.id,
    targetUserId: target._id,
    action: "force_logout",
  });
  await createAccountEvent({
    userId: target._id,
    action: "force_logout",
    message: "Admin requested you to log out and re-authenticate.",
    metadata: { requiresLogout: true },
  });

  return res.status(200).json({ message: "Logout notice was sent to user." });
};

const listLoginEvents = async (req, res) => {
  const { q, success } = req.query;
  const { page, limit, skip } = parsePagination(req);
  const filter = {};

  if (q && typeof q === "string" && q.trim()) {
    const search = q.trim();
    filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { ip: { $regex: search, $options: "i" } },
    ];
  }

  if (success !== undefined) {
    if (success === "true") filter.success = true;
    else if (success === "false") filter.success = false;
    else return res.status(400).json({ message: "success must be true or false." });
  }

  const [items, total] = await Promise.all([
    LoginEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LoginEvent.countDocuments(filter),
  ]);

  return res.status(200).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

const listAuditLogs = async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const [items, total] = await Promise.all([
    AdminAuditLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("adminId", "name email")
      .populate("targetUserId", "name email"),
    AdminAuditLog.countDocuments({}),
  ]);

  return res.status(200).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

module.exports = {
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
};
