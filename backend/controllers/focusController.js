const FocusSession = require("../models/FocusSession");

const startFocus = async (req, res) => {
  const { durationMinutes } = req.body;
  const minutes = Number(durationMinutes);
  if (!minutes || minutes < 5 || minutes > 180) {
    return res
      .status(400)
      .json({ message: "Duration must be between 5 and 180 minutes." });
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

  const session = await FocusSession.findOne({
    _id: sessionId,
    userId: req.user.id,
  });
  if (!session) {
    return res.status(404).json({ message: "Session not found." });
  }

  session.endedAt = new Date();
  session.tasksCompleted = Math.max(0, Number(tasksCompleted) || 0);
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
