const mongoose = require("mongoose");
const CourseData = require("./models/CourseData");
require("dotenv").config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/grade-calculator";
  await mongoose.connect(mongoUri);
  console.log("MongoDB Connected");
};

const insertCourses = async () => {
  const coursesData = [
    {
      courseCode: "CSE2008",
      courseName: "Operating Systems",
      hasLab: true,
      hasProject: false
    }
  ];

  try {
    for (const courseData of coursesData) {
      const existingCourse = await CourseData.findOne({ courseCode: courseData.courseCode });
      if (existingCourse) {
        console.log(`Course ${courseData.courseCode} already exists. Updating.`);
        existingCourse.courseName = courseData.courseName;
        existingCourse.hasLab = courseData.hasLab;
        existingCourse.hasProject = courseData.hasProject;
        await existingCourse.save();
      } else {
        const newCourse = new CourseData(courseData);
        await newCourse.save();
        console.log(`Inserted course ${courseData.courseCode}`);
      }
    }
    console.log("All courses inserted/updated successfully");
  } catch (error) {
    console.error("Error inserting courses:", error);
  }
};

const run = async () => {
  await connectDB();
  await insertCourses();
  mongoose.connection.close();
};

run();
