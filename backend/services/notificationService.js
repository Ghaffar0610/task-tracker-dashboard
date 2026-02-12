const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendTaskNotificationEmail } = require("./emailService");

const typeConfig = {
  task_created: {
    title: "Task created",
    message: (taskTitle) => `Task "${taskTitle}" was created.`,
  },
  task_updated: {
    title: "Task updated",
    message: (taskTitle) => `Task "${taskTitle}" was updated.`,
  },
  task_completed: {
    title: "Task completed",
    message: (taskTitle) => `Great work! Task "${taskTitle}" was completed.`,
  },
  task_deleted: {
    title: "Task deleted",
    message: (taskTitle) => `Task "${taskTitle}" was deleted.`,
  },
};

const shouldSendEmailForType = (user, type) => {
  if (!user?.emailNotificationsEnabled) return false;
  const selected = Array.isArray(user.emailNotificationTypes)
    ? user.emailNotificationTypes
    : [];
  if (selected.length === 0) return false;
  return selected.includes(type);
};

const createTaskNotification = async ({ userId, task, type }) => {
  const config = typeConfig[type];
  if (!config) return;

  const message = config.message(task.title);

  await Notification.create({
    userId,
    type,
    title: config.title,
    message,
    entityType: "task",
    entityId: task._id,
  });

  try {
    const user = await User.findById(userId).select(
      "email name emailNotificationsEnabled emailNotificationTypes"
    );
    if (!user || !shouldSendEmailForType(user, type)) return;

    await sendTaskNotificationEmail({
      userEmail: user.email,
      userName: user.name,
      title: config.title,
      message,
    });
  } catch (error) {
    // Notification should still be created even if email provider fails.
    console.error("Failed to send notification email:", error.message);
  }
};

module.exports = { createTaskNotification };
