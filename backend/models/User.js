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
    uiTheme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    workspaceName: {
      type: String,
      default: "",
      trim: true,
    },
    workspaceDefaultRole: {
      type: String,
      enum: ["member", "admin", "viewer"],
      default: "member",
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: "",
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralsCount: {
      type: Number,
      default: 0,
      min: 0,
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
    recoveryCodes: {
      type: [
        new mongoose.Schema(
          {
            codeHash: {
              type: String,
              required: true,
            },
            usedAt: {
              type: Date,
              default: null,
            },
          },
          { _id: false }
        ),
      ],
      default: [],
      select: false,
    },
    recoveryCodesGeneratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
