const router = require("express").Router();
const PreviousGradeRange = require("../models/PreviousGradeRange");
const { auth } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

// Fetch all faculties from faculty_list.json
router.get("/all-faculties", auth, (req, res) => {
  console.log("GET /all-faculties hit by", req.user?.email);
  try {
    const filePath = path.join(__dirname, "../faculty_list.json");
    console.log("Faculty list file path:", filePath);
    const exists = fs.existsSync(filePath);
    console.log("Faculty list file exists:", exists);
    if (!exists) {
      return res.status(404).json({ message: "Faculty list file not found" });
    }
    const fileData = fs.readFileSync(filePath, "utf-8");
    const faculties = JSON.parse(fileData);
    const sortedFaculties = [...new Set(faculties.map((f) => f.faculty_name))].sort();
    console.log("Successfully loaded faculties count:", sortedFaculties.length);
    res.json(sortedFaculties);
  } catch (err) {
    console.error("Error reading faculty list:", err);
    res.status(500).json({ message: "Server error reading faculty list" });
  }
});
// Fetch all previous grade ranges
router.get("/", auth, async (req, res) => {
  try {
    const ranges = await PreviousGradeRange.find({});
    res.json(ranges);
  } catch (err) {
    console.error("Error fetching previous grade ranges:", err);
    res.status(500).json({ message: "Server error fetching grade ranges" });
  }
});

// Submit a new previous grade range
router.post("/", auth, async (req, res) => {
  const { courseCode, courseName, facultyName, gradeRanges } = req.body;

  // Simple validation
  if (!courseCode || !courseName || !facultyName || !gradeRanges) {
    return res.status(400).json({ message: "Course code, subject name, faculty name, and grade ranges are required" });
  }

  if (typeof courseCode !== "string" || courseCode.length > 50) {
    return res.status(400).json({ message: "Course code must be a string and cannot exceed 50 characters." });
  }
  if (typeof courseName !== "string" || courseName.length > 100) {
    return res.status(400).json({ message: "Subject name must be a string and cannot exceed 100 characters." });
  }
  if (typeof facultyName !== "string" || facultyName.length > 100) {
    return res.status(400).json({ message: "Faculty name must be a string and cannot exceed 100 characters." });
  }

  const grades = ["S", "A", "B", "C", "D", "E", "F"];
  for (const g of grades) {
    if (!gradeRanges[g]) {
      return res.status(400).json({ message: `Grade range for ${g} is required` });
    }
    if (typeof gradeRanges[g] !== "string" || gradeRanges[g].length > 50) {
      return res.status(400).json({ message: `Grade range for ${g} must be a string and cannot exceed 50 characters.` });
    }
  }

  try {
    // 1. Uniqueness check: Alert user if course code details are already filled
    const existing = await PreviousGradeRange.findOne({ courseCode });
    if (existing) {
      return res.status(400).json({ message: "Details are already filled for this course" });
    }

    // 2. Student rate limiting: A student can't submit for more than 20 faculties
    const email = req.user.email;
    if (email.endsWith("@vitapstudent.ac.in")) {
      const uploadCount = await PreviousGradeRange.countDocuments({ submittedBy: email });
      if (uploadCount >= 20) {
        return res.status(400).json({ message: "Submission limit of 20 entries reached" });
      }
    }

    // 3. Create entry
    const newEntry = new PreviousGradeRange({
      courseCode,
      courseName,
      facultyName,
      gradeRanges,
      submittedBy: email
    });

    await newEntry.save();
    res.json({ message: "Grade ranges uploaded successfully" });
  } catch (err) {
    console.error("Error uploading previous grade ranges:", err);
    res.status(500).json({ message: "Server error uploading grade ranges" });
  }
});

module.exports = router;
