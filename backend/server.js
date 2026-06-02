require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const otpRoutes = require("./routes/otp");
const auth = require("./middleware/auth");

const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // Load passport strategy configuration

const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    
    app.use(cors({
      origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "https://grades-calc-phi.vercel.app", "https://vitapgradecalculator.vercel.app"],
      credentials: true
    }));
    app.use(express.json());

    // Setup sessions and passport middlewares
    app.use(session({
      secret: process.env.SESSION_SECRET || 'grade-calc-secret',
      resave: false,
      saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Fixed routes: OAuth on /auth, user auth on /api/user
    app.use("/auth", otpRoutes);
    app.use("/api/user", require("./routes/authRoutes"));

    app.use("/api/courses", require("./routes/courseRoutes"));
    app.use("/api/slots", require("./routes/slotRoutes"));
    app.use("/api/marks", require("./routes/marks"));
    app.use("/api/admin", require("./routes/adminRoutes"));
    app.use("/api/previous-grade-ranges", require("./routes/previousGradeRangeRoutes"));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
