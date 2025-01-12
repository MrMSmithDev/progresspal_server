const mongoose = require("mongoose");
const User = require("../models/user");

const { generateSaltHash, verifyPassword } = require("../lib/password");
const { verifySignupInput } = require("../lib/verification");
const {
  authenticateRefreshToken,
  generateToken,
  generateRefreshToken,
} = require("../lib/jwt");

// POST /Login
module.exports.login = async function (req, res) {
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
module.exports.refreshToken = async function (req, res) {
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
module.exports.signup = async function (req, res) {
  const { username, email, password, passwordRepeat } = req.body;
  let { target } = req.body;

  const inputIsValid = await verifySignupInput(
    username,
    email,
    password,
    passwordRepeat,
  );
  if (inputIsValid.error) {
    return res.status(inputIsValid.status).json({ error: inputIsValid.error });
  }

  const { salt, hash } = generateSaltHash(password);

  if (target && /^\d+$/.test(target)) {
    target = parseInt(target, 10);
    if (target > 28) target = 28;
  } else {
    target = null;
  }

  try {
    const userObject = new User({
      username,
      salt,
      hash,
      email: email.toLowerCase(),
      target,
    });

    const result = await userObject.save();

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
module.exports.getUserById = async function (req, res) {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: `Invalid user ID: ${userId}` });

  try {
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json({ error: `Cannot locate user with id: ${userId}` });

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
  // TODO: add limit to search
  const { username, email, limit = 50 } = req.query;

  // Check limit is valid and set to default if not
  let parsedLimit = parseInt(limit, 10);
  if (!/^\d+$/.test(req.query.limit) || isNaN(parsedLimit)) parsedLimit = 50;

  let query;

  if (username) {
    query.username = { $regex: new RegExp(username, "i") };
  }

  if (email) {
    query.email = { $regex: new RegExp(email, "i") };
  }

  try {
    const result = await User.find(query).limit(limit);

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

// PUT change-role/:userid - restricted to admin
module.exports.changeRole = async function (req, res) {
  const { userId } = req.params;
  const { admin } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: `Invalid user ID: ${userId}` });
  }

  try {
    const result = await User.updateOne({ _id: userId }, { admin });
    return res.json({ message: "Updated docs:", result });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// PUT /:userId single - restricted to user // TODO

// DELETE /:userId - restricted to user/admin
module.exports.deleteUser = async function (req, res) {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: `Invalid user ID: ${userId}` });
  }

  try {
    await User.deleteOne({ _id: userId });

    return res.json({ message: "" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};
