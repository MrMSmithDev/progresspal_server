const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, min: 3, max: 30 },
  email: { type: String, required: true, unique: true, min: 5 },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  target: { type: Number, min: 1, max: 28, default: null },
  admin: { type: Boolean, default: false },
  workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Workout" }],
  weightTracker: [{ type: mongoose.Schema.Types.ObjectId, ref: "Workout" }],
});

module.exports = mongoose.model("user", UserSchema);
