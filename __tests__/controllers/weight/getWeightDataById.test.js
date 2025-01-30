/* eslint-disable no-undef */
const { getWeightDataById } = require("../../../controllers/weight");
const Weight = require("../../../models/weight");
const mongoose = require("mongoose");
const cache = require("../../../config/cache");

jest.mock("../../../models/weight");
jest.mock("mongoose");
jest.mock("../../../config/cache");
jest.mock("../../../lib/cacheUtils");

describe("WEIGHT getWeightDataById", () => {
  let req, res;

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

  it("retrieves a weight by searching for the specified id", async () => {
    await getWeightDataById(req, res);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith("test_id");
    expect(Weight.findById).toHaveBeenCalledWith("test_id");
    expect(res.json).toHaveBeenCalledWith({
      _id: "test_id",
      userId: "test_user",
      unit: "met",
      date: "test_date",
      weight: "1",
    });
  });

  it("handles when no user is found by returning 404 and relevant error message", async () => {
    Weight.findById.mockResolvedValueOnce(null);

    await getWeightDataById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Weight data not found" });
  });

  it("handles invalid userId by returning 400 and relevant error message", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await getWeightDataById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid weightId" });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    Weight.findById.mockRejectedValueOnce(mockError);

    await getWeightDataById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });

  it("checks cache using the created cache key for cached data", async () => {
    await getWeightDataById(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
  });

  it("sets cached data to cache key if no cached data previously found", async () => {
    await getWeightDataById(req, res);

    expect(cache.setex).toHaveBeenCalledWith(
      "test_cache_key",
      1800,
      JSON.stringify({
        _id: "test_id",
        userId: "test_user",
        unit: "met",
        date: "test_date",
        weight: "1",
      }),
    );
  });

  it("sends the cached data if cached data is found", async () => {
    cache.get.mockImplementationOnce((key, callback) =>
      callback(
        null,
        JSON.stringify({
          _id: "test_id",
          userId: "test_user",
          unit: "met",
          date: "test_date",
          weight: "1",
        }),
      ),
    );

    await getWeightDataById(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
    expect(res.json).toHaveBeenCalledWith({
      _id: "test_id",
      userId: "test_user",
      unit: "met",
      date: "test_date",
      weight: "1",
    });
  });
});
