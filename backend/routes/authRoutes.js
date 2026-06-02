const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");


router.get("/me", auth, (req, res) => {
  res.json({ email: req.user.email, role: req.user.role });
});

router.post("/feedback", auth, async (req, res) => {
  const { feedback } = req.body;
  if (!feedback) return res.status(400).json({ message: "Feedback is required" });

  if (typeof feedback !== "string" || feedback.length > 500) {
    return res.status(400).json({ message: "Feedback must be a string and cannot exceed 500 characters." });
  }

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Restrict total feedback entries per user to prevent DB bloat
    if (user.feedback && user.feedback.length >= 10) {
      return res.status(400).json({ message: "Feedback submission limit reached (Max 10 submissions)." });
    }

    if (!user.feedback) {
      user.feedback = [];
    }

    user.feedback.push(feedback);
    await user.save();
    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
