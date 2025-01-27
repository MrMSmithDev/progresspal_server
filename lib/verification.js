const User = require("../models/user");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email regex
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/; // Alphanumeric usernames

module.exports.verifySignupInput = async function (
  username,
  email,
  password,
  passwordRepeat,
) {
  // All fields are non-empty strings
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { status: 400, error: "All fields are required as not empty" };
  }

  // Check repeated password
  if (password !== passwordRepeat) {
    return { status: 400, error: "Passwords do not match" };
  }

  // Length requirements
  if (username.length < 3 || username.length > 30) {
    return {
      status: 400,
      error:
        "Username must be at least 3 characters and at most 30 characters long",
    };
  }

  if (email.length < 5) {
    return { status: 400, error: "Email must be at least 5 characters long" };
  }

  if (password.length < 8) {
    return {
      status: 400,
      error: "Password must be at least 5 characters long",
    };
  }

  // Username and email are of expected format
  if (!usernameRegex.test(username)) {
    return {
      status: 400,
      error: "Username can only contain letters, numbers and underscores",
    };
  }

  if (!emailRegex.test(email)) {
    return {
      status: 400,
      error: "Email must be of expected format, e.g. example@email.com",
    };
  }

  // Check if username is taken
  const existingUser = await User.find({
    username: { $regex: new RegExp(username, "i") },
  });

  if (existingUser.length > 0) {
    return { status: 400, error: "Username already exists" };
  }

  // All validations pass
  return { status: 200, error: null };
};

const verifyExerciseInput = function (exerciseArr) {
  // Validate each exercise is as expected
  let exerciseCheck = {};
  exerciseArr.forEach((exercise) => {
    // Validate exercise type
    if (!["strength", "cardio"].includes(exercise.type)) {
      exerciseCheck = {
        status: 400,
        error: "Invalid exercise type. Must be 'strength' or 'cardio'.",
      };
      return;
    }

    // Validate name
    if (
      !exercise.name ||
      exercise.name.length < 1 ||
      exercise.name.length > 100
    ) {
      exerciseCheck = {
        status: 400,
        error: "Invalid exercise name. Must be between 1 and 100 characters.",
      };
      return;
    }

    // Validate sets
    if (exercise.type === "strength") {
      if (
        !exercise.sets ||
        !Array.isArray(exercise.sets) ||
        exercise.sets.length === 0
      ) {
        exerciseCheck = {
          status: 400,
          error: "Strength exercises must include at least one set.",
        };
        return;
      }

      for (const set of exercise.sets) {
        if (typeof set.weight !== "number" || set.weight < 0) {
          exerciseCheck = {
            status: 400,
            error:
              "Invalid set weight. Must be a number greater than or equal to 0.",
          };
          return;
        }
        if (typeof set.reps !== "number" || set.reps < 1) {
          exerciseCheck = {
            status: 400,
            error:
              "Invalid set reps. Must be a number greater than or equal to 1.",
          };
          return;
        }
      }
    }

    // Validate distance
    if (
      exercise.type === "cardio" &&
      (typeof exercise.distance !== "number" || exercise.distance <= 0)
    ) {
      exerciseCheck = {
        status: 400,
        error:
          "Invalid distance for cardio exercise. Must be a positive number.",
      };
      return;
    }
  });

  return exerciseCheck;
};

module.exports.verifyWorkoutInput = function (date, length, exercises) {
  // Validate date not in the future
  const parsedDate = new Date(date);
  if (parsedDate > new Date()) {
    return {
      status: 400,
      error: "Invalid date. Cannot use future times and dates",
    };
  }

  // Validate length of exercise
  if (length <= 0 || length > 1500) {
    return {
      status: 400,
      error: "Invalid length. Must be between 1 and 1500 minutes",
    };
  }

  // Validate exercises is of correct type
  if (!Array.isArray(exercises)) {
    return {
      status: 400,
      error: "Invalid exercises. Error parsing created exercises",
    };
  }

  // Validate that at least one exercise is included
  if (exercises.length <= 0) {
    return {
      status: 400,
      error: "Invalid exercises. Must include at least one exercise undertaken",
    };
  }

  // Validate exercises are of expectedFormat
  const isValid = verifyExerciseInput(exercises);
  if (isValid.error) return isValid;

  return { status: 200, error: null };
};

module.exports.verifyUpdatePasswordInput = function (
  newPassword,
  repeatPassword,
) {
  if (typeof newPassword !== "string" || typeof repeatPassword !== "string") {
    return {
      status: 400,
      error: "All inputs are required as not empty",
    };
  }

  if (newPassword.length < 8) {
    return {
      status: 400,
      error: "Password must be at least 5 characters long",
    };
  }

  if (newPassword !== repeatPassword) {
    return {
      status: 400,
      error: "Passwords do not match",
    };
  }

  return { status: 200, error: null };
};
