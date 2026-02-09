const Activity = require("../models/Activity");

const getActivity = async (req, res) => {
  const items = await Activity.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10);

  return res.status(200).json(items);
};

module.exports = { getActivity };
