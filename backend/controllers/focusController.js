const FocusSession = require("../models/FocusSession");
const mongoose = require("mongoose");

const MAX_TASKS_COMPLETED = 1000;

const startFocus = async (req, res) => {
  const { durationMinutes } = req.body;
  const minutes = Number(durationMinutes);
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 180) {
    return res
      .status(400)
      .json({ message: "Duration must be between 5 and 180 minutes." });
  }

  const activeSession = await FocusSession.findOne({
    userId: req.user.id,
    endedAt: null,
  }).select("_id");
  if (activeSession) {
    return res.status(409).json({ message: "A focus session is already active." });
  }

  const session = await FocusSession.create({
    userId: req.user.id,
    startedAt: new Date(),
    durationMinutes: minutes,
    tasksCompleted: 0,
  });

  return res.status(201).json(session);
};

const stopFocus = async (req, res) => {
  const { sessionId, tasksCompleted } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "Session id is required." });
  }
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session id." });
  }

  const tasksCount = Number(tasksCompleted);
  if (
    tasksCompleted !== undefined &&
    (!Number.isInteger(tasksCount) ||
      tasksCount < 0 ||
      tasksCount > MAX_TASKS_COMPLETED)
  ) {
    return res.status(400).json({
      message: `tasksCompleted must be an integer between 0 and ${MAX_TASKS_COMPLETED}.`,
    });
  }

  const session = await FocusSession.findOne({
    _id: sessionId,
    userId: req.user.id,
  });
  if (!session) {
    return res.status(404).json({ message: "Session not found." });
  }
  if (session.endedAt) {
    return res.status(409).json({ message: "Session is already stopped." });
  }

  session.endedAt = new Date();
  session.tasksCompleted = Number.isInteger(tasksCount) ? tasksCount : 0;
  await session.save();

  return res.status(200).json(session);
};

const getSummary = async (req, res) => {
  const days = 7;
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - days);

  const sessions = await FocusSession.find({
    userId: req.user.id,
    startedAt: { $gte: from },
  }).sort({ startedAt: -1 });

  const totalMinutes = sessions.reduce(
    (sum, item) => sum + (item.durationMinutes || 0),
    0
  );
  const totalTasks = sessions.reduce(
    (sum, item) => sum + (item.tasksCompleted || 0),
    0
  );
  const focusScore = totalTasks * 10 + totalMinutes;

  const dateKey = (value) => {
    const d = new Date(value);
    return d.toISOString().slice(0, 10);
  };
  const sessionDays = new Set(
    sessions.map((item) => dateKey(item.endedAt || item.startedAt))
  );

  let streak = 0;
  const current = new Date();
  while (true) {
    const key = dateKey(current);
    if (sessionDays.has(key)) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return res.status(200).json({
    streak,
    totalMinutes,
    totalTasks,
    focusScore,
    recentSessions: sessions.slice(0, 5),
  });
};

module.exports = { startFocus, stopFocus, getSummary };
