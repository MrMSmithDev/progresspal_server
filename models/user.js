const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  // email
  // hash
  // salt
  // Workouts
});

module.exports = mongoose.model("user", UserSchema);
