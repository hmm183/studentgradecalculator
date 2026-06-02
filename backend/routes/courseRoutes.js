const router = require("express").Router();
const CourseData = require("../models/CourseData");
const { auth } = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const courses = await CourseData.find();
  res.json(courses);
});

module.exports = router;
