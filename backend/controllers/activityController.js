const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const User = require("../models/User");

const ALLOWED_ACTIONS = new Set(["created", "updated", "completed", "deleted"]);
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDateInput = (value) => {
  if (value === undefined) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getActivity = async (req, res) => {
  const { action, q, from, to, limit } = req.query;
  const query = { userId: req.user.id };
  const numericLimit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(limit) || DEFAULT_LIMIT)
  );

  if (action) {
    if (!ALLOWED_ACTIONS.has(action)) {
      return res.status(400).json({ message: "Invalid action filter." });
    }
    query.action = action;
  }

  if (from || to) {
    const fromDate = parseDateInput(from);
    const toDate = parseDateInput(to);
    if ((from && !fromDate) || (to && !toDate)) {
      return res.status(400).json({ message: "Invalid date range." });
    }
    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({ message: "Invalid date range." });
    }
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = fromDate;
    if (toDate) query.createdAt.$lte = toDate;
  }

  if (q) {
    if (typeof q !== "string") {
      return res.status(400).json({ message: "Search query must be a string." });
    }
    const trimmed = q.trim();
    if (trimmed.length > 200) {
      return res.status(400).json({ message: "Search query is too long." });
    }
    query.message = { $regex: escapeRegex(trimmed), $options: "i" };
  }

  const items = await Activity.find(query)
    .sort({ createdAt: -1 })
    .limit(numericLimit);

  return res.status(200).json(items);
};

const deleteActivity = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid activity id." });
  }

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
