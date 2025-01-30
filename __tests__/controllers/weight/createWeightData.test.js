/* eslint-disable no-undef */
const { createWeightData } = require("../../../controllers/weight");
const Weight = require("../../../models/weight");
const mongoose = require("mongoose");
const { verifyWeightInput } = require("../../../lib/verification");

jest.mock("../../../models/weight");
jest.mock("../../../lib/verification");

describe("WEIGHT createWeightData", () => {
  let req, res;
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      body: {
        date: new Date().toISOString(),
        unit: "met",
        weight: "10",
      },
      user: {
        _id: "test_user",
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

  it("creates a new set of weight data successfully", async () => {
    await createWeightData(req, res);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalled();
    expect(verifyWeightInput).toHaveBeenCalledWith(
      expect.any(Date),
      "met",
      "10",
    );
    expect(Weight).toHaveBeenCalledWith({
      userId: "test_user",
      date: req.body.date,
      unit: "met",
      weight: 10,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Weight data created",
      id: "test_id",
      data: {
        _id: "test_id",
        date: expect.any(String),
        unit: "met",
        weight: "10",
      },
    });
  });

  it("handles an invalid user id being set by prev middleware", async () => {
    req.user._id = "invalid";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await createWeightData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid userId" });
  });

  it("handles verifyWeightInput finding an error", async () => {
    verifyWeightInput.mockReturnValueOnce({
      status: 400,
      error: "Error found",
    });

    await createWeightData(req, res);

    expect(verifyWeightInput).toHaveBeenCalledWith(
      expect.any(Date),
      "met",
      "10",
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Error found" });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");

    Weight.mockImplementationOnce(() => ({
      save: jest.fn().mockRejectedValueOnce(mockError),
    }));

    await createWeightData(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
