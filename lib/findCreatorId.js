const Workout = require("../models/workout");

async function findCreatorId(workoutId) {
  try {
    const creatorId = await Workout.findOne({ _id: workoutId }).select(
      "userId - _id",
    );
    return creatorId;
  } catch (err) {
    console.log(`Error finding creator ID: ${err.message}`);
  }
}

module.exports = findCreatorId;
