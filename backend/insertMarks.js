const mongoose = require("mongoose");
const Marks = require("./models/Marks");
require("dotenv").config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/grade-calculator";
  await mongoose.connect(mongoUri);
  console.log("MongoDB Connected");
};

const insertMarks = async () => {
  const data = [
    { studentEmail: "AP2025262000998", slot: "A1", faculty: "Madugula Kiran Kumar" },
    { studentEmail: "AP2025262000979", slot: "A1", faculty: "Lalitha Kumari P" },
    { studentEmail: "AP2025262001004", slot: "A1", faculty: "Voddelli SriLakshmi" },
    { studentEmail: "AP2025262000973", slot: "A1", faculty: "Palacharla Ravi Kumar" },
    { studentEmail: "AP2025262000985", slot: "A1", faculty: "Afzal Hussain Shahid" },
    { studentEmail: "AP2025262000974", slot: "A2", faculty: "Palacharla Ravi Kumar" },
    { studentEmail: "AP2025262001005", slot: "A2", faculty: "POTU BHARATH" },
    { studentEmail: "AP2025262000999", slot: "A2", faculty: "Madugula Kiran Kumar" },
    { studentEmail: "AP2025262000986", slot: "A2", faculty: "Afzal Hussain Shahid" },
    { studentEmail: "AP2025262000968", slot: "A2", faculty: "Shalini Subramani" },
    { studentEmail: "AP2025262000992", slot: "A2", faculty: "GOKAPAY DILIP KUMAR" },
    { studentEmail: "AP2025262001006", slot: "B1", faculty: "POTU BHARATH" },
    { studentEmail: "AP2025262000993", slot: "B1", faculty: "Annapureddy V N Reddy" },
    { studentEmail: "AP2025262001000", slot: "B1", faculty: "KOTESWARA RAO MAKKENA" },
    { studentEmail: "AP2025262000969", slot: "B1", faculty: "Suresh Dara" },
    { studentEmail: "AP2025262000987", slot: "B1", faculty: "Chirra Venkata Ramireddy" },
    { studentEmail: "AP2025262000970", slot: "B2", faculty: "KOTESWARA RAO MAKKENA" },
    { studentEmail: "AP2025262000988", slot: "B2", faculty: "Chirra Venkata Ramireddy" },
    { studentEmail: "AP2025262000976", slot: "B2", faculty: "TAALAM NAGA RAJU" },
    { studentEmail: "AP2025262001001", slot: "B2", faculty: "Srinivasarao.Pokuri" },
    { studentEmail: "AP2025262000994", slot: "B2", faculty: "Annapureddy V N Reddy" },
    { studentEmail: "AP2025262000996", slot: "F1", faculty: "Voddelli SriLakshmi" },
    { studentEmail: "AP2025262000983", slot: "F1", faculty: "K Aravind" },
    { studentEmail: "AP2025262000977", slot: "F1", faculty: "Sandipan Maiti" },
    { studentEmail: "AP2025262000989", slot: "F1", faculty: "Shaik Subhani" },
    { studentEmail: "AP2025262001002", slot: "F1", faculty: "TAALAM NAGA RAJU" },
    { studentEmail: "AP2025262000971", slot: "F1", faculty: "Ngangbam Indrason" },
    { studentEmail: "AP2025262001003", slot: "F2", faculty: "Srinivasarao.Pokuri" },
    { studentEmail: "AP2025262000984", slot: "F2", faculty: "K Aravind" },
    { studentEmail: "AP2025262000978", slot: "F2", faculty: "Sandipan Maiti" },
    { studentEmail: "AP2025262000990", slot: "F2", faculty: "P. Kuppusamy" },
    { studentEmail: "AP2025262000972", slot: "F2", faculty: "GOKAPAY DILIP KUMAR" }
  ];

  try {
    for (const item of data) {
      const mark = new Marks({
        studentEmail: item.studentEmail,
        courseCode: "CSE2008",
        slot: item.slot,
        faculty: item.faculty,
        cat1: 0,
        cat2: 0,
        internals: 0,
        theoryFat: 0,
        labInternals: 0,
        labFat: 0,
        projectMarks: 0,
        theoryTotal: 0,
        finalTotal: 0
      });
      await mark.save();
    }
    console.log("Marks inserted successfully for CSE2008");
  } catch (error) {
    console.error("Error inserting marks:", error);
  }
};

const run = async () => {
  await connectDB();
  await insertMarks();
  mongoose.connection.close();
};

run();
