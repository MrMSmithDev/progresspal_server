const { isCreator, isAuth } = require("../middleware");
const workout = require("../controllers/workout");

const Router = require("express").Router;

const router = new Router();

// GET /:workoutId single workout
router.get("/:workoutId", workout.getWorkoutById);

// GET / all workouts for user - restricted to user
router.get("/", isAuth, workout.getUsersWorkouts);

// POST / - restricted to user
router.post("/", isAuth, workout.createWorkout);

// PUT /:workoutId - restricted to creator
router.put("/:workoutId", isCreator, workout.editWorkout);

// DELETE / - restricted to creator
router.delete("/workoutId", isCreator, workout.deleteWorkout);

module.exports = router;
