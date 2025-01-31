/* eslint-disable no-undef */
const { getUsersWorkouts } = require("../../../controllers/workout");
const Workout = require("../../../models/workout");
const mongoose = require("mongoose");
const cache = require("../../../config/cache");

jest.mock("../../../models/workout");
jest.mock("../../../config/cache");
jest.mock("../../../lib/cacheUtils");

describe("WORKOUT getUsersWorkout", () => {
  let req, res;

  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      user: {
        id: "test_user_id",
      },
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mongoose.Types.ObjectId.isValid = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns an array of workouts when provided valid userId", async () => {
    await getUsersWorkouts(req, res);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
      "test_user_id",
    );
    expect(Workout.find).toHaveBeenCalledWith({ userId: "test_user_id" });
    expect(Workout.find().sort).toHaveBeenCalledWith({ createdAt: "desc" });
    expect(Workout.find().sort().skip).toHaveBeenCalledWith(0);
    expect(Workout.find().sort().skip().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id_1",
        length: "15",
        date: "test_date",
        exercise: [],
      },
      {
        _id: "test_id_2",
        length: "15",
        date: "test_date",
        exercise: [],
      },
    ]);
  });

  it("handles being passed a skip query", async () => {
    req.query.skip = "15";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().skip).toHaveBeenCalledWith(15);
  });

  it("handles being passed an invalid skip query by defaulting to 0", async () => {
    req.query.skip = "invalid";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().skip).toHaveBeenCalledWith(0);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles being passed an invalid skip query including numerical digits by defaulting to 0", async () => {
    req.query.skip = "invalid20";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().skip).toHaveBeenCalledWith(0);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles being passed a limit query", async () => {
    req.query.limit = "50";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().skip().limit).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles being passed an invalid limit query by defaulting to 20", async () => {
    req.query.limit = "invalid";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().skip().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles being passed an invalid limit query including numerical digits by defaulting to 20", async () => {
    req.query.limit = "invalid10";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().skip().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles invalid userId by returning 400 and relevant error message", async () => {
    req.user._id = "invalid";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await getUsersWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid user ID: invalid",
    });
  });

  it("returns an empty array when no workouts are found", async () => {
    Workout.find().sort().skip().limit.mockResolvedValueOnce([]);

    await getUsersWorkouts(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    Workout.find().sort().skip().limit.mockRejectedValueOnce(mockError);

    await getUsersWorkouts(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });

  it("checks cache using the created cache key for cached data", async () => {
    await getUsersWorkouts(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
  });

  it("sets cached data to cache key if no cached data previously found", async () => {
    await getUsersWorkouts(req, res);

    expect(cache.setEx).toHaveBeenCalledWith(
      "test_cache_key",
      1800,
      JSON.stringify([
        {
          _id: "test_id_1",
          length: "15",
          date: "test_date",
          exercise: [],
        },
        {
          _id: "test_id_2",
          length: "15",
          date: "test_date",
          exercise: [],
        },
      ]),
    );
  });

  it("sends the cached data if cached data is found", async () => {
    cache.get.mockImplementationOnce((key, callback) =>
      callback(null, JSON.stringify(["test_cache_data"])),
    );

    await getUsersWorkouts(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
    expect(res.json).toHaveBeenCalledWith(["test_cache_data"]);
  });
});
