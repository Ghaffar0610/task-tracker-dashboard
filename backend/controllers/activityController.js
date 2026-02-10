const bcrypt = require("bcryptjs");
const Activity = require("../models/Activity");
const User = require("../models/User");

const getActivity = async (req, res) => {
  const { action, q, from, to, limit } = req.query;
  const query = { userId: req.user.id };

  if (action) {
    query.action = action;
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  if (q) {
    query.message = { $regex: q, $options: "i" };
  }

  const items = await Activity.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 20);

  return res.status(200).json(items);
};

const deleteActivity = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password." });
  }

  const activity = await Activity.findOneAndDelete({
    _id: id,
    userId: req.user.id,
  });

  if (!activity) {
    return res.status(404).json({ message: "Activity not found." });
  }

  return res.status(200).json({ message: "Activity deleted." });
};

module.exports = { getActivity, deleteActivity };
