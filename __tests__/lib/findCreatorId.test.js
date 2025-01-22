/* eslint-disable no-undef */
const findCreatorId = require("../../lib/findCreatorId");
const Workout = require("../../models/workout");

jest.mock("../../models/workout");

describe("findCreatorId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the creator ID when a valid workoutId is provided", async () => {
    const mockCreatorId = { userId: "12345" };

    const result = await findCreatorId("validWorkoutId");
    expect(Workout.findOne).toHaveBeenCalledWith({ _id: "validWorkoutId" });
    expect(Workout.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "validWorkoutId" }),
    );
    expect(Workout.findOne().select).toHaveBeenCalled();
    expect(result).toEqual(mockCreatorId);
  });

  it("should return undefined if the workout is not found", async () => {
    Workout.findOne().select.mockResolvedValueOnce(null);

    const result = await findCreatorId("nonExistentWorkoutId");
    expect(Workout.findOne).toHaveBeenCalledWith({
      _id: "nonExistentWorkoutId",
    });
    expect(result).toBeNull();
  });

  it("should handle errors thrown by the database query", async () => {
    const mockError = new Error("Database error");
    Workout.findOne().select.mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await findCreatorId("errorWorkoutId");
    expect(Workout.findOne).toHaveBeenCalledWith({ _id: "errorWorkoutId" });
    expect(consoleSpy).toHaveBeenCalledWith(
      `Error finding creator ID: ${mockError.message}`,
    );
    expect(result).toBeUndefined();

    consoleSpy.mockRestore();
  });
});
