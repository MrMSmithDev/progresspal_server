/* eslint-disable no-undef */
const { getWorkoutById } = require("../../../controllers/workout");
const Workout = require("../../../models/workout");
const mongoose = require("mongoose");

jest.mock("../../../models/workout");

describe("WORKOUT getWorkoutById", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        workoutId: "test_id",
      },
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

  it("retrieves a workout by searching for the specified id", async () => {
    await getWorkoutById(req, res);

    expect(Workout.findById).toHaveBeenCalledWith("test_id");
    expect(res.json).toHaveBeenCalledWith({
      _id: "test_id",
      length: "15",
      date: "test_date",
      exercise: [],
    });
  });

  it("handles when no workout is found by returning 404 and relevant error message", async () => {
    Workout.findById.mockResolvedValueOnce(null);

    await getWorkoutById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Cannot locate workout with id: test_id",
    });
  });

  it("handles invalid workoutId by returning 400 and relevant error message", async () => {
    res.params.workoutId = "invalid_id";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await getWorkoutById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid workout ID: invalid_id",
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    Workout.findById.mockRejectedValueOnce(mockError);

    await getWorkoutById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
