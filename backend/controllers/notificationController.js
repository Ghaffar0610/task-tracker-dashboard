const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit),
    Notification.countDocuments({ userId: req.user.id, isRead: false }),
  ]);

  return res.status(200).json({ items, unreadCount });
};

const markNotificationRead = async (req, res) => {
  const { id } = req.params;

  const item = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Notification not found." });
  }

  return res.status(200).json(item);
};

const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  return res.status(200).json({ message: "All notifications marked as read." });
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
