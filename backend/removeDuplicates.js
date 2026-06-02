const mongoose = require("mongoose");
const Marks = require("./models/Marks");
require("dotenv").config();

async function removeDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to database");

    // Aggregate to find duplicates
    const duplicates = await Marks.aggregate([
      {
        $group: {
          _id: {
            studentEmail: "$studentEmail",
            courseCode: "$courseCode",
            slot: "$slot",
            faculty: "$faculty",
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    console.log(`Found ${duplicates.length} groups of duplicates`);

    let totalDeleted = 0;

    for (const dup of duplicates) {
      // Sort ids by ObjectId (most recent last)
      const sortedIds = dup.ids.sort((a, b) => a.toString().localeCompare(b.toString()));
      // Keep the last one (most recent), delete the rest
      const toDelete = sortedIds.slice(0, -1);

      await Marks.deleteMany({ _id: { $in: toDelete } });
      totalDeleted += toDelete.length;

      console.log(`Deleted ${toDelete.length} duplicates for ${dup._id.studentEmail} - ${dup._id.courseCode} - ${dup._id.slot} - ${dup._id.faculty}`);
    }

    console.log(`Total duplicates deleted: ${totalDeleted}`);

    await mongoose.disconnect();
    console.log("Disconnected from database");
  } catch (error) {
    console.error("Error removing duplicates:", error);
  }
}

removeDuplicates();
