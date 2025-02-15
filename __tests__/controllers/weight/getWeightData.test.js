/* eslint-disable no-undef */
const { getWeightData } = require("../../../controllers/weight");
const Weight = require("../../../models/weight");
const mongoose = require("mongoose");
const { cache } = require("../../../config/cache");

jest.mock("../../../models/weight");
jest.mock("../../../config/cache");
jest.mock("../../../lib/cacheUtils");
jest.mock("mongoose");

describe("WEIGHT getWeightData", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      user: {
        id: "test_user",
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

  it("returns weight data, searching with default skip and limit params", async () => {
    await getWeightData(req, res);

    expect(Weight.find).toHaveBeenCalledWith({ userId: "test_user" });
    expect(Weight.find().sort().skip).toHaveBeenCalledWith(0);
    expect(Weight.find().sort().skip().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith({
      _id: "test_id",
      unit: "met",
      date: "test_date",
      weight: "1",
    });
  });

  it("handles being passed a skip query", async () => {
    req.query.skip = "3";

    await getWeightData(req, res);

    expect(Weight.find().sort().skip).toHaveBeenCalledWith(3);
  });

  it("handles being passed an invalid skip query by defaulting to 0", async () => {
    req.query.skip = "invalid3";

    await getWeightData(req, res);

    expect(Weight.find().sort().skip).toHaveBeenCalledWith(0);
  });

  it("handles being passed a limit query", async () => {
    req.query.limit = "10";

    await getWeightData(req, res);

    expect(Weight.find().sort().skip().limit).toHaveBeenCalledWith(10);
  });

  it("handles being passed an invalid limit query by defaulting to 5", async () => {
    req.query.limit = "invalid10";

    await getWeightData(req, res);

    expect(Weight.find().sort().skip().limit).toHaveBeenCalledWith(20);
  });

  it("handles being passed both skip and limit queries", async () => {
    req.query = { skip: "3", limit: "10" };

    await getWeightData(req, res);

    expect(Weight.find().sort().skip).toHaveBeenCalledWith(3);
    expect(Weight.find().sort().skip().limit).toHaveBeenCalledWith(10);
  });

  it("handles being passed an invalid skip query with a valid limit query", async () => {
    req.query = { skip: "invalid3", limit: "10" };

    await getWeightData(req, res);

    expect(Weight.find().sort().skip).toHaveBeenCalledWith(0);
    expect(Weight.find().sort().skip().limit).toHaveBeenCalledWith(10);
  });

  it("handles being passed a valid skip query with an invalid limit query", async () => {
    req.query = { skip: "3", limit: "invalid10" };

    await getWeightData(req, res);

    expect(Weight.find().sort().skip).toHaveBeenCalledWith(3);
    expect(Weight.find().sort().skip().limit).toHaveBeenCalledWith(20);
  });

  it("handles being passed a dateStart query", async () => {
    req.query.dateStart = new Date(Date.now() - 86400000);

    await getWeightData(req, res);

    expect(Weight.find).toHaveBeenCalledWith({
      userId: "test_user",
      createdAt: { $gte: expect.any(Date) },
    });
  });

  it("handles being passed an invalid dateStart query by ignoring query", async () => {
    req.query.dateStart = new Date("invalid");

    await getWeightData(req, res);

    expect(Weight.find).toHaveBeenCalledWith({
      userId: "test_user",
    });
  });

  it("handles being passed a dateEnd query", async () => {
    req.query.dateEnd = new Date(Date.now() - 86400000);

    await getWeightData(req, res);

    expect(Weight.find).toHaveBeenCalledWith({
      userId: "test_user",
      createdAt: { $lte: expect.any(Date) },
    });
  });

  it("handles being passed an invalid dateEnd query by ignoring query", async () => {
    req.query.dateEnd = new Date("invalid");

    await getWeightData(req, res);

    expect(Weight.find).toHaveBeenCalledWith({
      userId: "test_user",
    });
  });

  it("handles being passed both a dateStart and dateEnd query", async () => {
    req.query.dateStart = new Date(Date.now() - 96400000);
    req.query.dateEnd = new Date(Date.now() - 86400000);

    await getWeightData(req, res);

    expect(Weight.find).toHaveBeenCalledWith({
      userId: "test_user",
      createdAt: { $gte: expect.any(Date), $lte: expect.any(Date) },
    });
  });

  it("handles being passed both dates in the correct order by returning 403 and relevant error message", async () => {
    req.query.dateStart = new Date(Date.now() - 76400000);
    req.query.dateEnd = new Date(Date.now() - 86400000);

    await getWeightData(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Start date must be before the end date",
    });
  });

  it("handles invalid userId by returning 400 and relevant error message", async () => {
    req.user.id = "invalid";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await getWeightData(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid userId" });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    Weight.find().sort().skip().limit.mockRejectedValueOnce(mockError);

    await getWeightData(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });

  it("checks cache using the created cache key for cached data", async () => {
    await getWeightData(req, res);

    expect(cache.get).toHaveBeenCalledWith("test_cache_key");
  });

  it("sets cached data to cache key if no cached data previously found", async () => {
    await getWeightData(req, res);

    expect(cache.set).toHaveBeenCalledWith(
      "test_cache_key",
      JSON.stringify({
        _id: "test_id",
        unit: "met",
        date: "test_date",
        weight: "1",
      }),
      { EX: 1800 },
    );
  });

  it("sends the cached data if cached data is found", async () => {
    cache.get.mockImplementationOnce(() =>
      JSON.stringify({
        _id: "test_id",
        unit: "met",
        date: "test_date",
        weight: "1",
      }),
    );

    await getWeightData(req, res);

    expect(cache.get).toHaveBeenCalledWith("test_cache_key");
    expect(res.json).toHaveBeenCalledWith({
      _id: "test_id",
      unit: "met",
      date: "test_date",
      weight: "1",
    });
    expect(Weight.find).not.toHaveBeenCalled();
  });
});
