const Notification = require("../models/Notification");

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

const createTaskNotification = async ({ userId, task, type }) => {
  const config = typeConfig[type];
  if (!config) return;

  await Notification.create({
    userId,
    type,
    title: config.title,
    message: config.message(task.title),
    entityType: "task",
    entityId: task._id,
  });
};

module.exports = { createTaskNotification };
