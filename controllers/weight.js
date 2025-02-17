const Weight = require("../models/weight");
const mongoose = require("mongoose");
const { cache } = require("../config/cache");
const { verifyWeightInput } = require("../lib/verification");
const { createCacheKey } = require("../lib/cacheUtils");

// POST create weight data
module.exports.createWeightData = async function (req, res) {
  const { date, unit, weight } = req.body;
  const userId = req.user._id;

  const parsedDate = new Date(date);

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: "Invalid userId" });

  const isValid = verifyWeightInput(parsedDate, unit, weight);
  if (isValid.error) {
    return res.status(isValid.status).json({ error: isValid.error });
  }

  const parsedWeight = parseInt(weight, 10);

  const weightObject = new Weight({
    userId,
    date,
    unit,
    weight: parsedWeight,
  });

  try {
    const result = await weightObject.save();
    return res
      .status(201)
      .json({ message: "Weight data created", id: result._id, data: result });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// GET single weight data
module.exports.getWeightDataById = async function (req, res) {
  const { weightId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(weightId)) {
    return res.status(400).json({ error: "Invalid weightId" });
  }

  const cacheKey = createCacheKey("getWeightDataById", { weightId });

  try {
    const cachedData = await cache.get(cacheKey);

    if (cachedData) return res.json(JSON.parse(cachedData));

    const result = await Weight.findById(weightId);
    if (!result) {
      return res.status(404).json({ error: "Weight data not found" });
    }

    await cache.set(cacheKey, JSON.stringify(result), { EX: 1800 });

    return res.json(result);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// GET weight data
module.exports.getWeightData = async function (req, res) {
  const { dateStart, dateEnd, skip = 0, limit = 20 } = req.query;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ error: "Invalid userId" });

  let query = {};
  const currentDate = new Date();
  const parsedDateStart = new Date(dateStart);
  const parsedDateEnd = new Date(dateEnd);

  if (
    dateStart &&
    !isNaN(parsedDateStart.getTime()) &&
    parsedDateStart < currentDate
  ) {
    if (!query.createdAt) query = { createdAt: {} };
    query.createdAt.$gte = parsedDateStart;
  }

  if (
    dateEnd &&
    !isNaN(parsedDateEnd.getTime()) &&
    parsedDateEnd < currentDate
  ) {
    if (!query.createdAt) query = { createdAt: {} };
    query.createdAt.$lte = parsedDateEnd;
  }

  // Check dates are in correct order
  if (query.createdAt && query.createdAt.$gte && query.createdAt.$lte) {
    if (parsedDateStart > parsedDateEnd)
      return res
        .status(403)
        .json({ error: "Start date must be before the end date" });
  }

  // Check limit and skip are valid and set to default if not
  let parsedLimit = parseInt(limit, 10);
  let parsedSkip = parseInt(skip, 10);
  if (!/^\d+$/.test(req.query.limit) || isNaN(parsedLimit)) parsedLimit = 20;
  if (!/^\d+$/.test(req.query.skip) || isNaN(parsedSkip)) parsedSkip = 0;

  const cacheKey = createCacheKey("getWeightData", {
    userId,
    dateStart,
    dateEnd,
    skip,
    limit,
  });

  try {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const result = await Weight.find({ userId, ...query })
      .sort({ date: "desc" })
      .skip(parsedSkip)
      .limit(parsedLimit);

    await cache.set(cacheKey, JSON.stringify(result), { EX: 1800 });

    return res.json(result);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// PUT edit weight data - creatorOnly
module.exports.editWeightData = async function (req, res) {
  const { weight, date, unit } = req.body;
  const { weightId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(weightId))
    return res.status(400).json({ error: "Invalid weightId" });

  let updateData = {};

  if (date !== undefined) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime()) || parsedDate < new Date()) {
      updateData.date = parsedDate;
    }
  }

  if (weight !== undefined) {
    let parsedWeight = parseInt(weight, 10);
    if (/^\d+$/.test(weight) && !isNaN(parsedWeight)) {
      updateData.weight = parsedWeight;
    }
  }

  if (unit !== undefined && (unit == "met" || unit == "imp")) {
    updateData.unit = unit;
  }

  try {
    const result = await Weight.findOneAndUpdate(
      { _id: weightId },
      { ...updateData },
    );

    if (!result) {
      return res
        .status(403)
        .json({ error: "Unable to update data. Please try again later" });
    }

    return res.json({
      message: `Data updated: ${JSON.stringify(updateData)}`,
      result,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Internal server error: ${err.message}` });
  }
};

// DELETE weight data - creator only
module.exports.deleteWeightData = async function (req, res) {
  const { weightId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(weightId))
    return res.status(400).json({ error: "Invalid weightId" });

  try {
    const result = await Weight.deleteOne({ _id: weightId });

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
