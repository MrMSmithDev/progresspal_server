const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const findCreatorId = require("../lib/findCreatorId");

async function isCreator(req, res, next) {
  const { userId, workoutId, weightId } = req.params;

  let creatorId;

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    creatorId = userId;
  } else if (workoutId && mongoose.Types.ObjectId.isValid(workoutId)) {
    creatorId = await findCreatorId(workoutId, "workout");
  } else if (weightId && mongoose.Types.ObjectId.isValid(weightId)) {
    creatorId = await findCreatorId(workoutId, "weight");
  } else {
    return res.status(400).json({ error: "Missing id for authentication" });
  }

  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(403)
        .json({ error: "You are not authorized to complete this request" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload._id == creatorId) {
      req.user = payload;
      return next();
    } else {
      return res
        .status(403)
        .json({ error: `Only the original creator can complete this request` });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Error authenticating creator: ${err.message}` });
  }
}

module.exports = isCreator;
