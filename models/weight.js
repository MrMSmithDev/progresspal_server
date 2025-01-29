const mongoose = require("mongoose");

const WeightSchema = new mongoose.Schema({
  userId: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
  date: { type: Date, required: true },
  unit: { type: String, required: true, enum: ["met", "imp"] },
  weight: { type: Number, required: true, min: 0, max: 1000 },
});

module.exports = mongoose.model("weight", WeightSchema);
