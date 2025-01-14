const Workout = require("../models/workout");
const mongoose = require("mongoose");

const { verifyWorkoutInput } = require("../lib/verification");

// GET /:workoutId - single workout
module.exports.GetWorkoutById = async function (req, res) {
  const { workoutId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workoutId))
    return res.status(400).json({ error: `Invalid workout ID: ${workoutId}` });

  try {
    const workout = await Workout.findById(workoutId);

    if (!workout)
      return res
        .json(404)
        .json({ error: `Cannot locate workout with id: ${workoutId}` });

    return res.json(workout.toObject());
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// GET / all workouts - restricted to user
module.exports.getUsersWorkouts = async function (req, res) {
  const { userId } = req.params;
  const { limit = 20 } = req.query;

  // Check limit is valid and set to default if not
  let parsedLimit = parseInt(limit, 10);
  if (!/^\d+$/.test(req.query.limit) || isNaN(parsedLimit)) parsedLimit = 20;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: `Invalid user ID: ${userId}` });

  try {
    const result = await Workout.find({})
      .sort({ createdAt: "desc" })
      .limit(parsedLimit);

    if (result.length <= 0) return res.json([]);
    return res.json(result);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// POST / - restricted to currentUser
module.exports.createWorkout = async function (req, res) {
  const userId = req.user;
  const { date, length, exercises } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: `Invalid user ID: ${userId}` });

  const isValid = verifyWorkoutInput(date, length, exercises);
  if (isValid.error)
    return res.status(isValid.status).json({ error: isValid.error });

  try {
    const workoutObject = new Workout({
      userId,
      length,
      date: new Date(date),
      exercises,
    });

    const result = workoutObject.save();

    return res.status(201).json({
      message: `Workout created`,
      id: (await result)._id,
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// PUT /:workoutId - restricted to user // TODO

// DELETE / - restricted to user
module.exports.deleteWorkout = async function (req, res) {
  const { workoutId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workoutId))
    return res.status(400).json({ error: `Invalid workout ID: ${workoutId}` });

  try {
    const result = await Workout.deleteOne({ _id: workoutId });

    return res.json({
      message: `Deleted docs: ${result.deletedCount}`,
      deleted: result.deletedCount,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};
