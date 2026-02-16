const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select(
      "role isActive lockedUntil tokenVersion"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated." });
    }
    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      return res.status(423).json({ message: "Account is temporarily locked." });
    }
    if ((payload.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.user = { id: payload.userId, role: user.role || "member" };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
