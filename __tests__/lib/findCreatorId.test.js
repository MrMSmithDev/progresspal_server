/* eslint-disable no-undef */
const findCreatorId = require("../../lib/findCreatorId");
const Workout = require("../../models/workout");
const Weight = require("../../models/weight");

jest.mock("../../models/workout");
jest.mock("../../models/weight");

describe("findCreatorId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the creator ID when a valid workoutId is provided", async () => {
    const mockCreatorId = { userId: "12345" };

    const result = await findCreatorId("validWorkoutId", "workout");
    expect(Workout.findOne).toHaveBeenCalledWith({ _id: "validWorkoutId" });
    expect(Workout.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "validWorkoutId" }),
    );
    expect(Workout.findOne().select).toHaveBeenCalled();
    expect(result).toEqual(mockCreatorId.userId);
  });

  it("should return the creator ID when a valid weightId is provided", async () => {
    const mockCreatorId = { userId: "12345" };

    const result = await findCreatorId("validWeightId", "weight");
    expect(Weight.findOne).toHaveBeenCalledWith({ _id: "validWeightId" });
    expect(Weight.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "validWeightId" }),
    );
    expect(Weight.findOne().select).toHaveBeenCalled();
    expect(result).toEqual(mockCreatorId.userId);
  });

  it("should return undefined if the workout is not found", async () => {
    Workout.findOne().select.mockResolvedValueOnce(null);

    const result = await findCreatorId("nonExistentWorkoutId", "workout");
    expect(Workout.findOne).toHaveBeenCalledWith({
      _id: "nonExistentWorkoutId",
    });
    expect(result).toBeNull();
  });

  it("should handle errors thrown by the database query", async () => {
    const mockError = new Error("Database error");
    Workout.findOne().select.mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await findCreatorId("errorWorkoutId", "workout");
    expect(Workout.findOne).toHaveBeenCalledWith({ _id: "errorWorkoutId" });
    expect(consoleSpy).toHaveBeenCalledWith(
      `Error finding creator ID: ${mockError.message}`,
    );
    expect(result).toBeUndefined();
  });
});
