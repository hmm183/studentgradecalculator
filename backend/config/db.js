const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/grade-calculator";
  await mongoose.connect(mongoUri);
  console.log("MongoDB Connected via:", mongoUri.split('@')[0] + '...' ); // Partial log for security
};

module.exports = connectDB;
