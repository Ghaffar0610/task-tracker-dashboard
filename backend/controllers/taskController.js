const Task = require("../models/Task");
const Activity = require("../models/Activity");
const { createTaskNotification } = require("../services/notificationService");

const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json(tasks);
};

const createTask = async (req, res) => {
  const { title, description, status } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  const task = await Task.create({
    title,
    description: description || "",
    status: status || "pending",
    userId: req.user.id,
  });

  await Activity.create({
    userId: req.user.id,
    action: "created",
    entityId: task._id,
    entityType: "task",
    message: `Task "${task.title}" created`,
  });

  await createTaskNotification({
    userId: req.user.id,
    task,
    type: "task_created",
  });

  return res.status(201).json(task);
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  const task = await Task.findOne({ _id: id, userId: req.user.id });
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const previousStatus = task.status;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;

  await task.save();

  const action =
    status !== undefined &&
    status === "completed" &&
    previousStatus !== "completed"
      ? "completed"
      : "updated";

  await Activity.create({
    userId: req.user.id,
    action,
    entityId: task._id,
    entityType: "task",
    message: `Task "${task.title}" ${action}`,
  });

  await createTaskNotification({
    userId: req.user.id,
    task,
    type: action === "completed" ? "task_completed" : "task_updated",
  });

  return res.status(200).json(task);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  await Activity.create({
    userId: req.user.id,
    action: "deleted",
    entityId: task._id,
    entityType: "task",
    message: `Task "${task.title}" deleted`,
  });

  await createTaskNotification({
    userId: req.user.id,
    task,
    type: "task_deleted",
  });

  return res.status(200).json({ message: "Task deleted." });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
