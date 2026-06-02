const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentEmail: String,
  courseCode: String,
  slot: String,
  faculty: String,

  cat1: Number,
  cat2: Number,
  internals: Number,
  theoryFat: Number,

  labInternals: Number,
  labFat: Number,

  projectMarks: Number,

  theoryTotal: Number,
  finalTotal: Number
});

module.exports = mongoose.model("Marks", marksSchema);
