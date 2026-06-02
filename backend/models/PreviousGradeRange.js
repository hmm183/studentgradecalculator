const mongoose = require("mongoose");

const previousGradeRangeSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  facultyName: { type: String, required: true },
  gradeRanges: {
    S: { type: String, required: true },
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
    E: { type: String, required: true },
    F: { type: String, required: true }
  },
  submittedBy: { type: String, required: true }
});

module.exports = mongoose.model("PreviousGradeRange", previousGradeRangeSchema);
