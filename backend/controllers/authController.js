const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { consumeRecoveryCode } = require("../services/recoveryCodeService");
const {
  ensureUniqueReferralCode,
  ensureUserHasReferralCode,
  awardReferralChainPoints,
} = require("../services/referralService");

const defaultNotificationTypes = [
  "task_created",
  "task_updated",
  "task_completed",
  "task_deleted",
];

const normalizeEmail = (value = "") => value.trim().toLowerCase();

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const toUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
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
      : defaultNotificationTypes,
});

const register = async (req, res) => {
  const { name, email, password, referralCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = normalizeEmail(email);
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: "Email already in use." });
  }

  let referrer = null;
  if (referralCode) {
    referrer = await User.findOne({ referralCode: String(referralCode).trim() });
    if (!referrer) {
      return res.status(400).json({ message: "Invalid referral code." });
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  const userReferralCode = await ensureUniqueReferralCode();
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashed,
    referralCode: userReferralCode,
    referredBy: referrer ? referrer._id : null,
  });

  if (referrer) {
    // Only referrers earn points. Unlimited chain.
    await awardReferralChainPoints({ directReferrerId: referrer._id });
  }

  const refreshed = await User.findById(user._id);
  const token = createToken(user._id);
  return res.status(201).json({
    token,
    user: toUserPayload(refreshed || user),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = normalizeEmail(email);
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // Ensure old accounts get a referral code so the invite link always shows.
  if (!user.referralCode || !String(user.referralCode).trim()) {
    const code = await ensureUserHasReferralCode(user._id);
    user.referralCode = code || "";
  }

  const token = createToken(user._id);
  return res.status(200).json({
    token,
    user: toUserPayload(user),
  });
};

const resetPasswordWithRecoveryCode = async (req, res) => {
  const { email, recoveryCode, newPassword } = req.body;

  if (!email || !recoveryCode || !newPassword) {
    return res.status(400).json({
      message: "Email, recovery code, and new password are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = normalizeEmail(email);
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+recoveryCodes"
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid email or recovery code." });
  }

  const consumed = consumeRecoveryCode(user, recoveryCode);
  if (!consumed) {
    return res.status(401).json({ message: "Invalid email or recovery code." });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.status(200).json({ message: "Password reset successful." });
};

module.exports = { register, login, resetPasswordWithRecoveryCode };
