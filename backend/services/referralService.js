const crypto = require("crypto");
const User = require("../models/User");

const generateReferralCode = () => crypto.randomBytes(5).toString("hex");

const ensureUniqueReferralCode = async () => {
  for (let attempts = 0; attempts < 8; attempts += 1) {
    const code = generateReferralCode();
    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }
  throw new Error("Unable to generate referral code.");
};

const ensureUserHasReferralCode = async (userId) => {
  const user = await User.findById(userId).select("referralCode");
  if (!user) return null;
  if (user.referralCode && String(user.referralCode).trim()) return user.referralCode;

  const code = await ensureUniqueReferralCode();
  user.referralCode = code;
  await user.save();
  return code;
};

const awardReferralChainPoints = async ({
  directReferrerId,
  directPoints = 100,
  indirectPoints = 25,
}) => {
  if (!directReferrerId) return;

  const visited = new Set();
  const directId = String(directReferrerId);
  visited.add(directId);

  // Direct referrer: points + referralsCount.
  await User.updateOne(
    { _id: directReferrerId },
    { $inc: { referralPoints: directPoints, referralsCount: 1 } }
  );

  // Walk unlimited levels up the chain.
  let current = await User.findById(directReferrerId).select("referredBy");
  while (current?.referredBy) {
    const parentId = String(current.referredBy);
    if (visited.has(parentId)) break;
    visited.add(parentId);

    await User.updateOne(
      { _id: current.referredBy },
      { $inc: { referralPoints: indirectPoints } }
    );

    current = await User.findById(current.referredBy).select("referredBy");
  }
};

module.exports = {
  ensureUniqueReferralCode,
  ensureUserHasReferralCode,
  awardReferralChainPoints,
};

