const router = require("express").Router();
const CourseData = require("../models/CourseData");
const Marks = require("../models/Marks");
const { mean, std, grade } = require("../utils/gradeEngine");
const { auth, adminAuth }  = require("../middleware/auth");

router.post("/submit", auth, async (req, res) => {
  const { courseCode, slot, faculty } = req.body;
  if (!courseCode || !slot || !faculty) {
    return res.status(400).json({ message: "Course code, slot, and faculty are required." });
  }

  // Basic length validation to prevent overflow spam
  if (courseCode.length > 50 || slot.length > 50 || faculty.length > 100) {
    return res.status(400).json({ message: "Invalid input length for course details." });
  }

  try {
    const courseData = await CourseData.findOne({ courseCode });
    if (!courseData) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Verify slot exists for this course
    const slotObj = courseData.slots.find(s => s.slotName === slot);
    if (!slotObj) {
      return res.status(400).json({ message: "Invalid slot for this course." });
    }

    // Verify faculty exists in the selected slot
    const facultyExists = slotObj.faculties.includes(faculty);
    if (!facultyExists) {
      return res.status(400).json({ message: "Invalid faculty for this slot." });
    }

    // List of fields to validate based on course type
    const numFields = [
      { name: "cat1", max: 50 },
      { name: "cat2", max: 50 },
      { name: "internals", max: 30 },
      { name: "theoryFat", max: 100 }
    ];

    if (courseData.hasLab) {
      numFields.push({ name: "labInternals", max: 60 });
      numFields.push({ name: "labFat", max: 50 });
    }

    if (courseData.hasProject) {
      numFields.push({ name: "projectMarks", max: 100 });
    }

    for (const field of numFields) {
      const val = req.body[field.name];
      if (val === undefined || val === null || val === "") {
        return res.status(400).json({ message: `${field.name} marks are required.` });
      }
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > field.max) {
        return res.status(400).json({ message: `Invalid marks for ${field.name}. Must be between 0 and ${field.max}.` });
      }
    }

    const studentEmail = req.user.email;
    const data = {
      studentEmail,
      courseCode,
      slot,
      faculty,
      cat1: Number(req.body.cat1),
      cat2: Number(req.body.cat2),
      internals: Number(req.body.internals),
      theoryFat: Number(req.body.theoryFat)
    };

    if (courseData.hasLab) {
      data.labInternals = Number(req.body.labInternals);
      data.labFat = Number(req.body.labFat);
    }
    if (courseData.hasProject) {
      data.projectMarks = Number(req.body.projectMarks);
    }

    // Check if marks already exist for the exact same student, course, slot, and faculty
    const existingExact = await Marks.findOne({
      studentEmail: data.studentEmail,
      courseCode: data.courseCode,
      slot: data.slot,
      faculty: data.faculty
    });

    if (existingExact) {
      // Update existing entry
      const theory =
        (data.cat1 / 50) * 15 +
        (data.cat2 / 50) * 15 +
        (data.internals / 30) * 30 +
        (data.theoryFat / 100) * 40;

      let finalTotal = theory;

      if (courseData.hasLab) {
        const lab =
          (data.labInternals / 60) * 60 +
          (data.labFat / 50) * 40;
        finalTotal = theory * 0.75 + lab * 0.25;
      }

      if (courseData.hasProject) {
        finalTotal = theory * 0.75 + data.projectMarks * 0.25;
      }

      await Marks.updateOne(
        { _id: existingExact._id },
        {
          ...data,
          theoryTotal: theory,
          finalTotal
        }
      );
      return res.json({ message: "Marks updated successfully" });
    }

    // Check if marks already exist for the same student and course (any slot/faculty)
    const existingCourse = await Marks.findOne({
      studentEmail: data.studentEmail,
      courseCode: data.courseCode
    });

    if (existingCourse) {
      return res.status(400).json({ message: "Marks already entered for this course." });
    }

    // Create new entry
    const theory =
      (data.cat1 / 50) * 15 +
      (data.cat2 / 50) * 15 +
      (data.internals / 30) * 30 +
      (data.theoryFat / 100) * 40;

    let finalTotal = theory;

    if (courseData.hasLab) {
      const lab =
        (data.labInternals / 60) * 60 +
        (data.labFat / 50) * 40;
      finalTotal = theory * 0.75 + lab * 0.25;
    }

    if (courseData.hasProject) {
      finalTotal = theory * 0.75 + data.projectMarks * 0.25;
    }

    const newMark = new Marks({
      ...data,
      theoryTotal: theory,
      finalTotal
    });
    await newMark.save();
    res.json({ message: "Marks saved" });
  } catch (err) {
    console.error("Error saving/updating marks:", err);
    res.status(500).json({ message: "Server error saving marks." });
  }
});

router.get("/result/:course/:slot", auth, async (req, res) => {
  const records = await Marks.find({ courseCode: req.params.course, slot: req.params.slot });

  if (records.length < 20)
    return res.json({ message: "Grades not available yet" });

  const totals = records.map(r => r.finalTotal);
  const m = mean(totals);
  const s = std(totals, m);

  let threshold = m + 1.2 * s;
  if (threshold>100) {
    threshold=100;
  }
  if(threshold<81){
    threshold=81;
  }

  const sorted = [...totals].sort((a, b) => b - a);
  if (sorted.filter(x => x > threshold).length > 4) {
    threshold = sorted[3];
  }

  const results = records.map(r => ({
    email: r.studentEmail,
    total: r.finalTotal,
    grade: grade(r.finalTotal, m, s, threshold)
  }));

  res.json(results);
});

router.get("/all-results", adminAuth, async (req, res) => {
  const records = await Marks.find({});

  if (records.length < 20)
    return res.json({ message: "No marks available" });

  // Get unique course codes and fetch course names
  const courseCodes = [...new Set(records.map(r => r.courseCode))];
  const courseData = await CourseData.find({ courseCode: { $in: courseCodes } });
  const courseMap = {};
  courseData.forEach(c => {
    courseMap[c.courseCode] = c.courseName;
  });

  // Group by course, slot, and faculty for grading
  const grouped = {};
  records.forEach(r => {
    const key = `${r.courseCode}-${r.slot}-${r.faculty}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const allResults = [];
  for (const key in grouped) {
    const group = grouped[key];
    const totals = group.map(r => r.finalTotal);
    const m = mean(totals);
    const s = std(totals, m);

    let threshold = m + 1.2 * s;
    if (threshold > 100) threshold = 100;
    if (threshold < 81) threshold = 81;

    const sorted = [...totals].sort((a, b) => b - a);
    if (sorted.filter(x => x > threshold).length > 4) {
      threshold = sorted[3];
    }

    group.forEach(r => {
      allResults.push({
        email: r.studentEmail,
        courseCode: r.courseCode,
        courseName: courseMap[r.courseCode] || r.courseCode,
        slot: r.slot,
        faculty: r.faculty,
        total: r.finalTotal,
        grade: grade(r.finalTotal, m, s, threshold)
      });
    });
  }

  res.json(allResults);
});

router.get("/user-results", auth, async (req, res) => {
  const userEmail = req.user.email;
  const userRecords = await Marks.find({ studentEmail: userEmail });

  if (userRecords.length < 1)
    return res.json({ message: "No marks available" });

  // Fetch all records for the course-slot-faculty groups the user belongs to
  const groups = {};
  userRecords.forEach(r => {
    const key = `${r.courseCode}-${r.slot}-${r.faculty}`;
    if (!groups[key]) groups[key] = { courseCode: r.courseCode, slot: r.slot, faculty: r.faculty };
  });

  const records = [];
  const pendingGroups = [];
  for (const key in groups) {
    const groupRecords = await Marks.find({
      courseCode: groups[key].courseCode,
      slot: groups[key].slot,
      faculty: groups[key].faculty
    });
    if (groupRecords.length < 7) {
      const userRecord = groupRecords.find(r => r.studentEmail === userEmail);
      pendingGroups.push({ ...groups[key], userCount: groupRecords.length, total: userRecord ? userRecord.finalTotal : null });
    } else {
      records.push(...groupRecords);
    }
  }

  // Group by course, slot, and faculty for grading
  const grouped = {};
  records.forEach(r => {
    const key = `${r.courseCode}-${r.slot}-${r.faculty}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const userResults = [];
  for (const key in grouped) {
    const group = grouped[key];
    const totals = group.map(r => r.finalTotal);
    const m = mean(totals);
    const s = std(totals,m);

    let threshold = m + 1.2 * s;
    if (threshold > 100) threshold = 100;
    if (threshold < 81) threshold = 81;

    const sorted = [...totals].sort((a, b) => b - a);
    if (sorted.filter(x => x > threshold).length > 4) {
      threshold = sorted[3];
    }

    // Calculate grade ranges
    const f = Math.ceil(m - 2 * s);
    const e = Math.ceil(m - 1.5 * s);
    const d = Math.ceil(m - s);
    const c = Math.ceil(m - 0.55 * s);
    const b = Math.ceil(m + 0.45 * s);
    // console.log("abhay");
    // console.log(m);
    // console.log(s);
    const gradeRanges = {
      S: `>= ${Math.ceil(threshold)}`,
      A: `${Math.ceil(b)} - ${Math.ceil(threshold)-1}`,
      B: `${Math.ceil(c)} - ${Math.ceil(b)-1}`,
      C: `${Math.ceil(d)} - ${Math.ceil(c)-1}`,
      D: `${Math.ceil(e)} - ${Math.ceil(d)-1}`,
      E: `${Math.ceil(f)} - ${Math.ceil(e)-1}`,
      F: `< ${Math.ceil(f)}`
    };

    // Get course name
    const courseData = await CourseData.findOne({ courseCode: group[0].courseCode });
    const courseName = courseData ? courseData.courseName : group[0].courseCode;

    group.forEach(r => {
      if (r.studentEmail === userEmail) {
        userResults.push({
          courseCode: r.courseCode,
          courseName,
          slot: r.slot,
          faculty: r.faculty,
          total: r.finalTotal,
          grade: grade(r.finalTotal, m, s, threshold),
          gradeRanges,
          userCount: group.length
        });
      }
    });
  }

  // Add pending groups
  for (const pending of pendingGroups) {
    const courseData = await CourseData.findOne({ courseCode: pending.courseCode });
    const courseName = courseData ? courseData.courseName : pending.courseCode;
    userResults.push({
      courseCode: pending.courseCode,
      courseName,
      slot: pending.slot,
      faculty: pending.faculty,
      pending: true,
      userCount: pending.userCount,
      total: pending.total
    });
  }

  res.json(userResults);
});

module.exports = router;
