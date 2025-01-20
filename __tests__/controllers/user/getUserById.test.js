/* eslint-disable no-undef */
const { getUserById } = require("../../../controllers/user");
const User = require("../../../models/user");
const mongoose = require("mongoose");
const cache = require("../../../config/cache");

jest.mock("../../../config/cache");
jest.mock("../../../lib/cacheUtils");
jest.mock("../../../models/user");

describe("USER getUserById", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        userId: "test_id",
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

  it("retrieves a user by searching for the specified id", async () => {
    await getUserById(req, res);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith("test_id");
    expect(User.findById).toHaveBeenCalledWith("test_id");
    expect(res.json).toHaveBeenCalledWith({
      _id: "test_id",
      username: "test_username",
      email: "test@email.com",
    });
  });

  it("handles when no user is found by returning 404 and relevant error message", async () => {
    User.findById.mockResolvedValueOnce(null);

    await getUserById(req, res);

    expect(User.findById).toHaveBeenCalledWith("test_id");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Cannot locate user with id: test_id",
    });
  });

  it("handles invalid userId by returning 400 and relevant error message", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await getUserById(req, res);

    expect(User.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid user ID: test_id",
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    User.findById.mockRejectedValueOnce(mockError);

    await getUserById(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });

  it("checks cache using the created cache key for cached data", async () => {
    await getUserById(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
  });

  it("sets cached data to cache key if no cached data previously found", async () => {
    await getUserById(req, res);

    expect(cache.setex).toHaveBeenCalledWith(
      "test_cache_key",
      1800,
      JSON.stringify({
        _id: "test_id",
        username: "test_username",
        email: "test@email.com",
      }),
    );
  });

  it("sends the cached data if cached data is found", async () => {
    cache.get.mockImplementationOnce((key, callback) =>
      callback(
        null,
        JSON.stringify({
          data: "test_cache_data",
          _id: "test_id",
          username: "test_username",
          email: "test@email.com",
        }),
      ),
    );

    await getUserById(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
    expect(res.json).toHaveBeenCalledWith({
      data: "test_cache_data",
      _id: "test_id",
      username: "test_username",
      email: "test@email.com",
    });
  });
});
