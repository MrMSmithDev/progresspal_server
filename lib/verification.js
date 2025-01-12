const User = require("../models/user");

const emailRegex = /^[a-z]/; // Email regex
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

  if (existingUser) {
    return { status: 400, error: "Username already exists" };
  }

  // All validations pass
  return { status: 200, error: null };
};
