const { isCreator, isAuth } = require("../middleware");

const Router = require("express").Router;

const router = new Router();

// GET /:workoutId single workout
router.get("/:workoutId", () => {});

// GET / all workouts for user - restricted to user
router.get("/", isAuth, () => {});

// POST / - restricted to user
router.post("/", isAuth, () => {});

// PUT /:workoutId - restricted to creator
router.put("/:workoutId", isCreator, () => {});

// DELETE / - restricted to creator
router.delete("/workoutId", isCreator, () => {});

module.exports = router;
