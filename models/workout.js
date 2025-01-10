const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  user: [{ type: mongoose.Types.ObjectId, ref: "user" }],
  // date
  // length (hours:mins)
});

module.exports = mongoose.model("workout", WorkoutSchema);
