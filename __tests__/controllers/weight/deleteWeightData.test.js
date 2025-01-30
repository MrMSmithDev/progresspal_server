/* eslint-disable no-undef */
const { deleteWeightData } = require("../../../controllers/weight");
const Weight = require("../../../models/weight");
const mongoose = require("mongoose");

jest.mock("../../../models/weight");
jest.mock("mongoose");

describe("WEIGHT deleteWeightData", () => {
  let req, res;
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      params: {
        weightId: "test_id",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mongoose.Types.ObjectId.isValid.mockImplementation(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deletes specified weight data", async () => {
    await deleteWeightData(req, res);

    expect(Weight.deleteOne).toHaveBeenCalledWith({ _id: "test_id" });
    expect(res.json).toHaveBeenCalledWith({
      message: "Deleted docs: 1",
      deleted: 1,
    });
  });

  it("handles invalid weightId by return 400 and relevant error message", async () => {
    req.params.workoutId = "invalid_id";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await deleteWeightData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid weightId",
    });
  });

  it("handles no workout being found gracefully", async () => {
    Weight.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

    await deleteWeightData(req, res);

    expect(Weight.deleteOne).toHaveBeenCalledWith({ _id: "test_id" });
    expect(res.json).toHaveBeenCalledWith({
      message: "Deleted docs: 0",
      deleted: 0,
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    Weight.deleteOne.mockRejectedValueOnce(mockError);

    await deleteWeightData(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
