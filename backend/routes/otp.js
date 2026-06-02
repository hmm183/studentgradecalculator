const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Google OAuth Initiation
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect((process.env.FRONTEND_URL || "http://localhost:3000") + "/login?error=Unauthorized");
      }

      // Generate JWT Token
      const token = jwt.sign(
        { email: user.email, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      // Redirect back to frontend login endpoint with token and email as query params
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/login?token=${token}&email=${user.email}`);
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect((process.env.FRONTEND_URL || "http://localhost:3000") + "/login?error=Server%20Error");
    }
  }
);

// Failure Redirect Route
router.get("/google/failure", (req, res) => {
  res.redirect((process.env.FRONTEND_URL || "http://localhost:3000") + "/login?error=Authentication%20Failed");
});

// Logout Route
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

module.exports = router;
