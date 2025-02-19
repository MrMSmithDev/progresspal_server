const Workout = require("../models/workout");
const mongoose = require("mongoose");
const { cache } = require("../config/cache");

const { verifyWorkoutInput } = require("../lib/verification");
const { convertExerciseToInt } = require("../lib/convertDataTypes");
const { createCacheKey } = require("../lib/cacheUtils");

// GET /:workoutId - single workout
module.exports.getWorkoutById = async function (req, res) {
  const { workoutId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workoutId))
    return res.status(400).json({ error: `Invalid workout ID: ${workoutId}` });

  const cacheKey = createCacheKey("getWorkoutById", { workoutId });

  try {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const result = await Workout.findById(workoutId);

    if (!result)
      return res
        .status(404)
        .json({ error: `Cannot locate workout with id: ${workoutId}` });

    await cache.set(cacheKey, JSON.stringify(result), { EX: 300 });

    return res.json(result.toObject());
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// GET / all workouts - restricted to user
module.exports.getUsersWorkouts = async function (req, res) {
  const { limit = "60", skip = "0" } = req.query;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: `Invalid user ID: ${userId}` });

  // Check limit and skip are valid and set to default if not
  let parsedLimit = parseInt(limit, 10);
  let parsedSkip = parseInt(skip, 10);
  if (!/^\d+$/.test(req.query.limit) || isNaN(parsedLimit)) parsedLimit = 60;
  if (!/^\d+$/.test(req.query.skip) || isNaN(parsedSkip)) parsedSkip = 0;

  const cacheKey = createCacheKey("getUsersWorkouts", {
    userId,
    limit: parsedLimit,
    skip: parsedSkip,
  });

  try {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const result = await Workout.find({ userId: userId })
      .sort({ createdAt: "desc" })
      .skip(parsedSkip)
      .limit(parsedLimit);

    if (result.length <= 0) return res.json([]);

    await cache.set(cacheKey, JSON.stringify(result), { EX: 300 });

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
  const userId = req.user.id;
  const { date, length, exercises, unit } = req.body;

  console.log(req.body);

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: `Invalid user ID: ${userId}` });

  const parsedLength = parseInt(length, 10);
  if (isNaN(length) || !/^\d+$/.test(length))
    return res.status(400).json({
      error: "Invalid length. Must be a valid positive number",
    });

  const parsedDate = new Date(date);
  const isValid = verifyWorkoutInput(parsedDate, parsedLength, exercises, unit);
  if (isValid.error)
    return res.status(isValid.status).json({ error: isValid.error });

  const parsedExercises = convertExerciseToInt(exercises);

  try {
    const workoutObject = new Workout({
      userId,
      unit,
      length: parsedLength,
      date: parsedDate,
      exercises: parsedExercises,
    });

    const result = await workoutObject.save();

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
module.exports.editWorkout = async function () {};

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
