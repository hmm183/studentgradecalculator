const mongoose = require("mongoose");
const CourseData = require("./models/CourseData");
require("dotenv").config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/grade-calculator";
  await mongoose.connect(mongoUri);
  console.log("MongoDB Connected");
};

const mergeSlots = (existingSlots, newSlots) => {
  for (const newSlot of newSlots) {
    let existingSlot = existingSlots.find(s => s.slotName === newSlot.slotName);
    if (!existingSlot) {
      existingSlots.push(newSlot);
    } else {
      for (const fac of newSlot.faculties) {
        if (!existingSlot.faculties.includes(fac)) {
          existingSlot.faculties.push(fac);
        }
      }
    }
  }
};

const insertSlots = async () => {
  // --- NEW ADDED COURSES DATA ---

  const chy2001Slots = [
    { slotName: "C2/TC2", faculties: ["GANGADHAR PAMARTHI"] }
  ];

  const cse1008Slots = [
    { slotName: "A1/TA1/TAA1", faculties: ["Karthika Natarajan", "Sheela jayachandran", "Sanal Kumar T S", "Dasari Venkata Lakshmi"] },
    { slotName: "A2/TA2/TAA2", faculties: ["Dasari Venkata Lakshmi", "Sheela jayachandran", "SHAIK MAHABOOB BASHA", "Karthika Natarajan"] },
    { slotName: "B1/TB1/TBB1", faculties: ["Bommareddy Lokesh", "Vikash Kumar Singh", "Manomita Chakraborty", "Udit Narayana Kar", "Ravi Shankar Barpanda"] },
    { slotName: "B2/TB2/TBB2", faculties: ["Sanal Kumar T S", "Manomita Chakraborty", "Vikash Kumar Singh", "Bommareddy Lokesh", "Udit Narayana Kar", "Ravi Shankar Barpanda"] }
  ];

  const cse2003Slots = [
    { slotName: "A1/TA1", faculties: ["PREM SWARUP MALLIPUDI", "Khasim Syed"] },
    { slotName: "A2/TA2", faculties: ["Khasim Syed"] }
  ];

  // Replaced with Introduction to Machine Learning data
  const cse3008Slots = [
    { slotName: "E1/TE1", faculties: ["Yallanti Sowjanya Kumari", "THOTA RAMATHULASI", "Renita R", "Bileesh P Babu", "Pujari Jeevana Jyothi"] },
    { slotName: "E1/TEE1", faculties: ["P. Kuppusamy"] },
    { slotName: "E2/TE2", faculties: ["Pujari Jeevana Jyothi", "Karrothu Aravind", "Chintakindi Balaram Murthy", "Bileesh P Babu", "Selva Kumar S"] },
    { slotName: "F1/TF1", faculties: ["SHAIK MOINUDDIN AHMED", "Chintakindi Balaram Murthy", "Shalini Subramani", "Saroja Kumar Rout", "TANUKONDA PADMAJA"] },
    { slotName: "F1/TFF1", faculties: ["Suresh Dara"] },
    { slotName: "F2/TF2", faculties: ["TANIKELLA DIVYA NAGA PAVANI", "ANANTHA HARITHA", "MEKATHOTI VAMSI KIRAN", "Siddique Ibrahim Peer Mohamed"] },
    { slotName: "F2/TFF2", faculties: ["VENKATA SIVANARAYANA GAYYI", "Renita R", "Saroja Kumar Rout", "Karrothu Aravind"] }
  ];

  const cse4004Slots = [
    { slotName: "C1/TC1", faculties: ["Kommerla Siva Kumar", "Samuka Mohanty", "Monalisa Sahu", "K Aravind", "Bharathi V C", "Adla Padma"] },
    { slotName: "C1/TCC1", faculties: ["Kailash Chandra Mishra", "SANKURU RAVI PRAKASH"] },
    { slotName: "C2/TC2", faculties: ["Bharathi V C", "Samuka Mohanty", "Kommerla Siva Kumar", "Monalisa Sahu", "Pujari Jeevana Jyothi", "MEKATHOTI VAMSI KIRAN"] },
    { slotName: "C2/TCC2", faculties: ["K Aravind", "D. Kothandaraman"] },
    { slotName: "D1/TD1", faculties: ["MEKATHOTI VAMSI KIRAN", "Gokul Yenduri", "Chirra Venkata Ramireddy", "VENKATA SIVANARAYANA GAYYI"] },
    { slotName: "D1/TDD1", faculties: ["Madala Guru Brahmam", "MOHAMMAD SIRAJUDDIN", "KANAKA DURGA"] },
    { slotName: "D2/TD2", faculties: ["Chirra Venkata Ramireddy", "MOHAMMAD SIRAJUDDIN", "VENKATA SIVANARAYANA GAYYI", "Adla Padma", "TAALAM NAGA RAJU"] },
    { slotName: "D2/TDD2", faculties: ["Shalini Ramanathan", "KOTESWARA RAO MAKKENA", "POTU BHARATH"] }
  ];

  const cse4011Slots = [
    { slotName: "E1/TE1", faculties: ["Nandha Kumar R", "Ajay Dagar"] },
    { slotName: "E2/TE2", faculties: ["Kritika Bansal"] },
    { slotName: "F1/TF1", faculties: ["Kritika Bansal", "Ajay Dagar"] },
    { slotName: "F2/TF2", faculties: ["Ankur Pandey", "Ajay Dagar"] }
  ];

  const cse2013Slots = [
    { slotName: "A1/TA1/TAA1", faculties: ["Sameeulla Khan Md", "K N V P S Rajesh", "Kalapraveen Bagadi"] },
    { slotName: "A2/TA2/TAA2", faculties: ["Sameeulla Khan Md", "Saladi Saritha", "Kalapraveen Bagadi"] },
    { slotName: "D1/TD1/TDD1", faculties: ["Saladi Saritha", "Chandu DS"] },
    { slotName: "D2/SD2/TD2", faculties: ["Saladi Saritha"] },
    { slotName: "D2/TD2/TDD2", faculties: ["Chandu DS"] }
  ];

  const cse2009Slots = [
    { slotName: "A1/TA1", faculties: ["Posham Uppamma"] },
    { slotName: "A2/TA2", faculties: ["Posham Uppamma"] },
    { slotName: "E1/TE1", faculties: ["Shaik Subhani", "Allapati Rajya Lakshmi", "Suma Kamlesh Gandhimati"] },
    { slotName: "E2/TE2", faculties: ["Shaik Subhani", "Allapati Rajya Lakshmi", "Suma Kamlesh Gandhimati"] }
  ];

  try {
    let chy2001 = await CourseData.findOne({ courseCode: "CHY2001" });
    if (!chy2001) {
      // TH indicates Theory Only -> No Lab, No Project
      chy2001 = new CourseData({ courseCode: "CHY2001", courseName: "Chemical and Biosensors", hasLab: false, hasProject: false });
    }
    mergeSlots(chy2001.slots, chy2001Slots);
    await chy2001.save();

    let cse1008 = await CourseData.findOne({ courseCode: "CSE1008" });
    if (!cse1008) {
      // TH indicates Theory Only -> No Lab, No Project
      cse1008 = new CourseData({ courseCode: "CSE1008", courseName: "Theory of Computation", hasLab: false, hasProject: false });
    }
    mergeSlots(cse1008.slots, cse1008Slots);
    await cse1008.save();

    let cse2003 = await CourseData.findOne({ courseCode: "CSE2003" });
    if (!cse2003) {
      // ETH and EPJ indicates Theory + Project -> No Lab, Has Project
      cse2003 = new CourseData({ courseCode: "CSE2003", courseName: "Requirements Engineering Management", hasLab: false, hasProject: true });
    }
    mergeSlots(cse2003.slots, cse2003Slots);
    await cse2003.save();

    let cse3008 = await CourseData.findOne({ courseCode: "CSE3008" });
    if (!cse3008) {
      // ETH and ELA indicates Theory + Lab -> Has Lab, No Project
      cse3008 = new CourseData({ courseCode: "CSE3008", courseName: "Introduction to Machine Learning", hasLab: true, hasProject: false });
    }
    mergeSlots(cse3008.slots, cse3008Slots);
    await cse3008.save();

    let cse4004 = await CourseData.findOne({ courseCode: "CSE4004" });
    if (!cse4004) {
      // ETH and ELA indicates Theory + Lab -> Has Lab, No Project
      cse4004 = new CourseData({ courseCode: "CSE4004", courseName: "Web Technologies", hasLab: true, hasProject: false });
    }
    mergeSlots(cse4004.slots, cse4004Slots);
    await cse4004.save();

    let cse4011 = await CourseData.findOne({ courseCode: "CSE4011" });
    if (!cse4011) {
      // Assumed Theory Only based on "Embedded Theory" without EPJ/ELA specified
      cse4011 = new CourseData({ courseCode: "CSE4011", courseName: "Internet of Things", hasLab: false, hasProject: true });
    }
    mergeSlots(cse4011.slots, cse4011Slots);
    await cse4011.save();

    let cse2013 = await CourseData.findOne({ courseCode: "CSE2013" });
    if (!cse2013) {
      // Theory Only -> No Lab, No Project
      cse2013 = new CourseData({ courseCode: "CSE2013", courseName: "Information Theory and Coding", hasLab: false, hasProject: false });
    }
    mergeSlots(cse2013.slots, cse2013Slots);
    await cse2013.save();

    let cse2009 = await CourseData.findOne({ courseCode: "CSE2009" });
    if (!cse2009) {
      // Project based
      cse2009 = new CourseData({ courseCode: "CSE2009", courseName: "Soft Computing", hasLab: false, hasProject: true });
    }
    mergeSlots(cse2009.slots, cse2009Slots);
    await cse2009.save();

    console.log("All slots inserted/updated successfully!");
  } catch (error) {
    console.error("Error inserting slots:", error);
  }
};

const run = async () => {
  await connectDB();
  await insertSlots();
  mongoose.connection.close();
};

run();