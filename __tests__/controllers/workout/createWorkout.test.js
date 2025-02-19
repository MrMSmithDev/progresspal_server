/* eslint-disable no-undef */
const { createWorkout } = require("../../../controllers/workout");
const Workout = require("../../../models/workout");
const mongoose = require("mongoose");
const { verifyWorkoutInput } = require("../../../lib/verification");

jest.mock("../../../models/workout");
jest.mock("../../../lib/verification");
jest.mock("../../../lib/convertDataTypes");

describe("WORKOUT createWorkout", () => {
  let req, res;
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      user: {
        id: "test_user_id",
      },
      body: {
        date: new Date().toString(),
        unit: "met",
        length: "15",
        exercises: [
          {
            type: "cardio",
            name: "test_exercise",
            distance: "100",
          },
        ],
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

  it("creates a new workout successfully", async () => {
    await createWorkout(req, res);

    expect(verifyWorkoutInput).toHaveBeenCalledWith(
      expect.any(Date),
      15,
      expect.any(Array),
      "met",
    );
    expect(Workout).toHaveBeenCalledWith({
      userId: "test_user_id",
      length: 15,
      unit: "met",
      date: expect.any(Date),
      exercises: [
        {
          type: "cardio",
          name: "test_cardio",
          distance: 100,
        },
        {
          type: "strength",
          name: "test_strength",
          sets: [
            {
              weight: 10,
              reps: 12,
            },
          ],
        },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Workout created",
      id: "test_id",
      data: expect.any(Object),
    });
  });

  it("handles an invalid user id being set by prev middleware", async () => {
    req.user.id = "invalid_id";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await createWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid user ID: invalid_id",
    });
  });

  it("handles an invalid length argument being provided", async () => {
    req.body.length = "invalid";

    await createWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid length. Must be a valid positive number",
    });
  });

  it("handles an invalid length argument being provided", async () => {
    req.body.length = "invalid";

    await createWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid length. Must be a valid positive number",
    });
  });

  it("handles verifyWorkoutInput finding an error", async () => {
    verifyWorkoutInput.mockReturnValueOnce({
      status: 400,
      error: "Validation error",
    });

    await createWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");

    Workout.mockImplementationOnce(() => ({
      save: jest.fn().mockRejectedValueOnce(mockError),
    }));

    await createWorkout(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
