const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  userId: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
  unit: { type: String, required: true, enum: ["met", "imp"] },
  date: { type: Date, required: true },
  length: { type: Number, required: true, min: 1 },
  exercises: [
    {
      type: {
        type: String,
        required: true,
        enum: ["strength", "cardio"],
      },
      name: {
        type: String,
        required: true,
      },
      sets: [
        {
          weight: {
            type: Number,
            min: 0,
            validate: {
              validator: function (value) {
                // Make required if sets included
                return this.reps !== undefined || value == undefined;
              },
            },
          },
          reps: {
            type: Number,
            min: 1,
            validate: {
              validator: function (value) {
                // Make required if sets included
                return this.weight !== undefined || value == undefined;
              },
            },
          },
        },
      ],
      distance: {
        type: Number,
        min: 0,
        validate: {
          validator: function (value) {
            // Make required only for cardio type activities
            return this.type === "cardio" ? value !== undefined : true;
          },
          message: "Distance is required for cardio exercises",
        },
      },
    },
  ],
});

module.exports = mongoose.model("workout", WorkoutSchema);
