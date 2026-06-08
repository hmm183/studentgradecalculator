const router = require("express").Router();
const crypto = require("crypto");
const Course = require("../models/CourseData");
const User = require("../models/User");
const { adminAuth } = require("../middleware/auth");

router.use(adminAuth);

// Helper middleware to verify admin password header
const verifyAdminPassword = async (req, res, next) => {
  const adminPassword = req.header("X-Admin-Password");
  if (!adminPassword) {
    return res.status(401).json({ message: "Admin password required" });
  }

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Admin password is not configured" });
    }

    const [salt, hash] = user.password.split(":");
    if (!salt || !hash) {
      return res.status(500).json({ message: "Admin password configuration error" });
    }

    const verifyHash = crypto.pbkdf2Sync(adminPassword, salt, 1000, 64, "sha512").toString("hex");
    if (verifyHash !== hash) {
      return res.status(401).json({ message: "Invalid admin password" });
    }

    next();
  } catch (err) {
    console.error("Admin password verification error:", err);
    res.status(500).json({ message: "Server error during password verification" });
  }
};

router.post("/course", verifyAdminPassword, async (req, res) => {
  const { courseCode, courseName, hasLab, hasProject } = req.body;
  await Course.create({ courseCode, courseName, hasLab, hasProject });
  res.json({ message: "Course added" });
});

router.post("/slot", verifyAdminPassword, async (req, res) => {
  const { courseCode, slotName, faculties } = req.body;
  const course = await Course.findOne({ courseCode });
  if (!course) return res.status(404).json({ message: "Course not found" });
  course.slots.push({ slotName, faculties });
  await course.save();
  res.json({ message: "Slot added" });
});

router.get("/feedback", async (req, res) => {
  try {
    const users = await User.find({ "feedback.0": { $exists: true } }, "email feedback");
    const feedbacks = [];
    users.forEach(user => {
      user.feedback.forEach(item => {
        feedbacks.push({
          email: user.email,
          feedback: item,
        });
      });
    });
    res.json({ feedbacks });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: "Server error while fetching feedback" });
  }
});

module.exports = router;
