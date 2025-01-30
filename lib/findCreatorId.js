const Workout = require("../models/workout");
const Weight = require("../models/weight");
async function findCreatorId(dataId, type) {
  try {
    let creatorId;
    if (type === "workout") {
      creatorId = await Workout.findOne({ _id: dataId }).select("userId - _id");
    } else if (type === "weight") {
      creatorId = await Weight.findOne({ _id: dataId }).select("userId - _id");
    }
    if (!creatorId) return null;
    return creatorId.userId;
  } catch (err) {
    console.log(`Error finding creator ID: ${err.message}`);
  }
}

module.exports = findCreatorId;
