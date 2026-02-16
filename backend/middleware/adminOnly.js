const User = require("../models/User");

const adminOnly = async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  if (req.user.role === "admin") {
    return next();
  }

  const user = await User.findById(req.user.id).select("role");
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  req.user.role = "admin";
  return next();
};

module.exports = adminOnly;
