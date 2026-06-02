const mongoose = require("mongoose");

const courseDataSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  hasLab: Boolean,
  hasProject: Boolean,
  slots: [{
    slotName: String,
    faculties: [String]
  }]
});

module.exports = mongoose.model("CourseData", courseDataSchema);
