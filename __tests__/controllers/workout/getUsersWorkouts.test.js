/* eslint-disable no-undef */
const { getUsersWorkouts } = require("../../../controllers/workout");
const Workout = require("../../../models/workout");
const mongoose = require("mongoose");

jest.mock("../../../models/workout");

describe("WORKOUT getUsersWorkout", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        userId: "test_user_id",
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
    expect(Workout.find().sort().limit).toHaveBeenCalledWith(20);
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

  it("handles being passed a limit query", async () => {
    req.query.limit = "50";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().limit).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles being passed an invalid limit query by defaulting to 20", async () => {
    req.query.limit = "invalid";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles being passed an invalid limit query including numerical digits by defaulting to 20", async () => {
    req.query.limit = "invalid10";

    await getUsersWorkouts(req, res);

    expect(Workout.find().sort().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith([
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it("handles invalid userId by returning 400 and relevant error message", async () => {
    req.params.userId = "invalid";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await getUsersWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid user ID: invalid",
    });
  });

  it("returns an empty array when no workouts are found", async () => {
    Workout.find().sort().limit.mockResolvedValueOnce([]);

    await getUsersWorkouts(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    Workout.find().sort().limit.mockRejectedValueOnce(mockError);

    await getUsersWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
