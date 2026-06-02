const router = require("express").Router();
const CourseData = require("../models/CourseData");
const { auth } = require("../middleware/auth");

router.use(auth);

router.get("/:courseCode", async (req, res) => {
  const courseData = await CourseData.findOne({ courseCode: req.params.courseCode });
  res.json(courseData ? courseData.slots : []);
});

module.exports = router;
