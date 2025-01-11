const mongoose = require("mongoose");
const User = require("../models/user");

const { generateSaltHash, verifyPassword } = require("../lib/password");
const {
  authenticateRefreshToken,
  generateToken,
  generateRefreshToken,
} = require("../lib/jwt");

// POST /Login
module.export.login = async function (req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.find({ username: username });

    if (!user)
      return res.status(400).json({ error: "Invalid username or password" });

    const passwordValidity = verifyPassword(password, user.salt, user.hash);
    if (!passwordValidity)
      return res.status(400).json({ error: "Invalid username or password" });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      path: "/",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    res.json({ username: user.username, token });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// POST /refresh
module.export.refreshToken = async function (req, res) {
  if (req.cookies?.jwt) {
    const refreshToken = req.cookies.jwt;
    const isAuthenticated = authenticateRefreshToken(refreshToken);

    if (!isAuthenticated) {
      return res
        .status(406)
        .json({ error: "Refresh unsuccessful: Unauthorized" });
    }

    try {
      const user = await User.findById(isAuthenticated.id);
      const token = generateToken(user);

      return res.json({ token, username: user.username });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: `Internal server error: ${err.message}` });
    }
  } else {
    return res
      .status(406)
      .json({ error: "Refresh unsuccessful: Unauthorized" });
  }
};

// POST /Signup
module.export.signup = async function (req, res) {
  const { username, email, password, passwordRepeat, target } = req.body;
  // const inputIsValid = await verifySignupInput
  const inputIsValid = { status: 200, error: null }; // Add validity checking

  if (inputIsValid.error) {
    return res.status(inputIsValid.status).json({ error: inputIsValid.error });
  }

  const { salt, hash } = generateSaltHash(password);

  // check target here

  try {
    const userObject = new User({
      username,
      salt,
      hash,
      email: email.toLowerCase(),
      target: target ? target : null,
    });

    const result = userObject.save();

    const token = generateToken(result);
    const refreshToken = generateRefreshToken(result._id);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      path: "/",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: `User created`,
      id: result._id,
      token,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// GET /userId - single user
module.export.getUserById = async function (req, res) {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: `Invalid user ID: ${userId}` });

  try {
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json({ error: `Cannot locate user with id ${userId}` });

    return res.json(user.toObject());
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// GET all - restricted to admin

module.exports.searchUsers = async function (req, res) {
  // add limit to search
  const { username, email } = req.query;

  let query;

  if (username) {
    query.username = { $regex: new RegExp(username, "i") };
  }

  if (email) {
    query.email = { $regex: new RegExp(email, "i") };
  }

  try {
    const result = await User.find(query);

    if (result.length <= 0)
      return res.status(404).json({ error: "Users not found" });

    return res.json([...result]);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// PUT /:userId single - restricted to user

// PUT change-role/:userid - restricted to admin

// DELETE /:userId - restricted to user/admin
