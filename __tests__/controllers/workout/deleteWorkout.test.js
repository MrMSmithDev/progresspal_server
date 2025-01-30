/* eslint-disable no-undef */
const { deleteWorkout } = require("../../../controllers/workout");
const Workout = require("../../../models/workout");
const mongoose = require("mongoose");

jest.mock("../../../models/workout");

describe("WORKOUT deleteWorkout", () => {
  let req, res;

  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

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

  it("deletes specified workout", async () => {
    await deleteWorkout(req, res);

    expect(Workout.deleteOne).toHaveBeenCalledWith({ _id: "test_id" });
    expect(res.json).toHaveBeenCalledWith({
      message: "Deleted docs: 1",
      deleted: 1,
    });
  });

  it("handles invalid workoutId by returning 400 and relevant error message", async () => {
    req.params.workoutId = "invalid_id";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid workout ID: invalid_id",
    });
  });

  it("handles no workout being found gracefully", async () => {
    Workout.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

    await deleteWorkout(req, res);

    expect(Workout.deleteOne).toHaveBeenCalledWith({ _id: "test_id" });
    expect(res.json).toHaveBeenCalledWith({
      message: "Deleted docs: 0",
      deleted: 0,
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    Workout.deleteOne.mockRejectedValueOnce(mockError);

    await deleteWorkout(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
