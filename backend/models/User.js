const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: false,
    },
    emailNotificationTypes: {
      type: [String],
      enum: ["task_created", "task_updated", "task_completed", "task_deleted"],
      default: ["task_created", "task_updated", "task_completed", "task_deleted"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
