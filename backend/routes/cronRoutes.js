const router = require("express").Router();

router.get("/trigger", (req, res) => {
  const cronKey = req.header("X-Cron-Key");
  
  // Validate token if CRON_SECRET_KEY is configured in the environment
  if (process.env.CRON_SECRET_KEY && cronKey !== process.env.CRON_SECRET_KEY) {
    console.warn("Unauthorized cron ping attempt rejected.");
    return res.status(401).json({ message: "Unauthorized cron access." });
  }

  console.log("Cron keep-awake ping received successfully at:", new Date().toISOString());
  res.json({ message: "Cron ping successful. Server is awake!" });
});

module.exports = router;
