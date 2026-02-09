const mongoose = require("mongoose");

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
};

module.exports = connectDB;
