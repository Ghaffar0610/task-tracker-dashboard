const Task = require("../models/Task");
const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const { createTaskNotification } = require("../services/notificationService");

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;
const ALLOWED_STATUSES = new Set(["pending", "completed"]);

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeTitle = (value = "") => value.trim();

const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json(tasks);
};

const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const normalizedTitle = normalizeTitle(typeof title === "string" ? title : "");

  if (!normalizedTitle) {
    return res.status(400).json({ message: "Title is required." });
  }
  if (normalizedTitle.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ message: "Title is too long." });
  }
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ message: "Description must be a string." });
  }

  const normalizedDescription = description === undefined ? "" : description.trim();
  if (normalizedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return res.status(400).json({ message: "Description is too long." });
  }

  const nextStatus = status === undefined ? "pending" : status;
  if (!ALLOWED_STATUSES.has(nextStatus)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const duplicate = await Task.exists({
    userId: req.user.id,
    title: { $regex: `^${escapeRegex(normalizedTitle)}$`, $options: "i" },
  });
  if (duplicate) {
    return res.status(409).json({ message: "Task title already exists." });
  }

  const task = await Task.create({
    title: normalizedTitle,
    description: normalizedDescription,
    status: nextStatus,
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id." });
  }

  const task = await Task.findOne({ _id: id, userId: req.user.id });
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const previousStatus = task.status;
  if (title !== undefined) {
    if (typeof title !== "string") {
      return res.status(400).json({ message: "Title must be a string." });
    }
    const normalizedTitle = normalizeTitle(title);
    if (!normalizedTitle) {
      return res.status(400).json({ message: "Title is required." });
    }
    if (normalizedTitle.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({ message: "Title is too long." });
    }

    const duplicate = await Task.exists({
      _id: { $ne: id },
      userId: req.user.id,
      title: { $regex: `^${escapeRegex(normalizedTitle)}$`, $options: "i" },
    });
    if (duplicate) {
      return res.status(409).json({ message: "Task title already exists." });
    }

    task.title = normalizedTitle;
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ message: "Description must be a string." });
    }
    const normalizedDescription = description.trim();
    if (normalizedDescription.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({ message: "Description is too long." });
    }
    task.description = normalizedDescription;
  }

  if (status !== undefined) {
    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    task.status = status;
  }

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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id." });
  }

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
