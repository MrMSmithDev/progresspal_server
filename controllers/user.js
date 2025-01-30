const mongoose = require("mongoose");
const User = require("../models/user");
const cache = require("../config/cache");

const { createCacheKey } = require("../lib/cacheUtils");
const { generateSaltHash, verifyPassword } = require("../lib/password");
const {
  verifySignupInput,
  verifyUpdatePasswordInput,
} = require("../lib/verification");
const {
  authenticateRefreshToken,
  generateToken,
  generateRefreshToken,
} = require("../lib/jwt");

// POST /Login
module.exports.login = async function (req, res) {
  const { username, password } = req.body;

  try {
    const userSearch = await User.find({ username: username }).limit(1);
    const user = userSearch[0];

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

    return res.json({ username: user.username, token });
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
      if (!user)
        return res
          .status(400)
          .json({ error: "Refresh unsuccessful: unable to validate user" });

      const token = generateToken(user);
      if (!token)
        return res.status(400).json({
          error: "Refresh unsuccessful: unable to generate new token",
        });

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
      username: result.username,
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

  const cacheKey = createCacheKey("getUsedById", { userId });

  cache.get(cacheKey, async (err, cachedData) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: `Internal server error: ${err.message}` });
    }

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    try {
      const result = await User.findById(userId);

      if (!result)
        return res
          .status(404)
          .json({ error: `Cannot locate user with id: ${userId}` });

      cache.setEx(cacheKey, 1800, JSON.stringify(result));

      return res.json(result.toObject());
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: `Internal server error: ${err.message}` });
    }
  });
};

// GET all - restricted to admin

module.exports.searchUsers = async function (req, res) {
  const { username, email, limit = "50", skip = "0" } = req.query;

  // Check limit and skip are valid and set to default if not
  let parsedLimit = parseInt(limit, 10);
  let parsedSkip = parseInt(skip, 10);
  if (!/^\d+$/.test(req.query.limit) || isNaN(parsedLimit)) parsedLimit = 50;
  if (!/^\d+$/.test(req.query.skip) || isNaN(parsedSkip)) parsedSkip = 0;

  let query = {};

  if (username) {
    query.username = { $regex: new RegExp(username, "i") };
  }

  if (email) {
    query.email = { $regex: new RegExp(email, "i") };
  }

  const cacheKey = createCacheKey("searchUsers", {
    username: username || "undefined",
    email: email || "undefined",
    skip: parsedSkip,
    limit: parsedLimit,
  });

  cache.get(cacheKey, async (err, cachedData) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: `Internal server error: ${err.message}` });
    }

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    try {
      const result = await User.find(query).skip(parsedSkip).limit(parsedLimit);

      if (result.length <= 0) return res.json([]);

      cache.setEx(cacheKey, 1800, JSON.stringify(result));

      return res.json(result);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: `Internal server error: ${err.message}` });
    }
  });
};

// PUT change-role/:userid - restricted to admin
module.exports.changeRole = async function (req, res) {
  const { userId } = req.params;
  const { admin } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: `Invalid user ID: ${userId}` });
  }

  if (admin == undefined) {
    return res.status(400).json({ error: "Type change status invalid" });
  }

  try {
    const result = await User.updateOne({ _id: userId }, { admin });
    return res.json({ message: `Updated docs: ${result}` });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

module.exports.updatePassword = async function (req, res) {
  const { oldPassword, newPassword, repeatNewPassword } = req.body;
  const userId = req.user._id;

  const inputIsValid = verifyUpdatePasswordInput(
    newPassword,
    repeatNewPassword,
  );

  if (inputIsValid.error !== null) {
    return res.status(inputIsValid.status).json({ error: inputIsValid.error });
  }

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ error: `User not found` });

    const passwordIsVerified = verifyPassword(
      oldPassword,
      currentUser.salt,
      currentUser.hash,
    );

    if (!passwordIsVerified)
      return res.status(404).json({ error: "Bad authorization" });

    const { salt, hash } = generateSaltHash(newPassword);

    currentUser.salt = salt;
    currentUser.hash = hash;
    await currentUser.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// PUT /:userId single - restricted to user // TODO
module.exports.editUser = async function () {};

// DELETE /:userId - restricted to user/admin
module.exports.deleteUser = async function (req, res) {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: `Invalid user ID: ${userId}` });
  }

  try {
    const result = await User.deleteOne({ _id: userId });

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
