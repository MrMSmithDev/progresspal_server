/* eslint-disable no-undef */
const { searchUsers } = require("../../../controllers/user");
const User = require("../../../models/user");
const cache = require("../../../config/cache");

jest.mock("../../../config/cache");
jest.mock("../../../lib/cacheUtils");
jest.mock("../../../models/user");

describe("USER searchUsers", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("retrieves an array of users, limited to 50 when passed no queries", async () => {
    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(User.find().skip).toHaveBeenCalledWith(0);
    expect(User.find().skip().limit).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "test_username",
        email: "test@email.com",
        salt: "test_salt",
        hash: "test_hash",
      },
      {
        _id: "test_id2",
        username: "test_username2",
        email: "test@email.com2",
        salt: "test_salt",
        hash: "test_hash",
      },
    ]);
  });

  it("return an empty dataset, when no users match the query", async () => {
    User.find().skip().limit.mockResolvedValueOnce([]);

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("searches for username when username query provided", async () => {
    req.query.username = "queried_username";
    User.find()
      .skip()
      .limit.mockResolvedValueOnce([
        {
          _id: "test_id",
          username: "queried_username",
          email: "test@email.com",
        },
      ]);

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({
      username: { $regex: /queried_username/i },
    });
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "queried_username",
        email: "test@email.com",
      },
    ]);
  });

  it("searches for email when email query provided", async () => {
    req.query.email = "queried@email.com";
    User.find()
      .skip()
      .limit.mockResolvedValueOnce([
        {
          _id: "test_id",
          username: "test_username",
          email: "queried@email.com",
        },
      ]);

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({
      email: { $regex: /queried@email.com/i },
    });
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "test_username",
        email: "queried@email.com",
      },
    ]);
  });

  it("searches using valid structure when provided username and email queries", async () => {
    req.query.username = "queried_username";
    req.query.email = "queried@email.com";
    User.find()
      .skip()
      .limit.mockResolvedValueOnce([
        {
          _id: "test_id",
          username: "queried_username",
          email: "queried@email.com",
        },
      ]);

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({
      username: { $regex: /queried_username/i },
      email: { $regex: /queried@email.com/i },
    });
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "queried_username",
        email: "queried@email.com",
      },
    ]);
  });

  it("adjust skip when valid skip query is provided", async () => {
    req.query.skip = "10";

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(User.find().skip).toHaveBeenCalledWith(10);
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "test_username",
        email: "test@email.com",
        salt: "test_salt",
        hash: "test_hash",
      },
      {
        _id: "test_id2",
        username: "test_username2",
        email: "test@email.com2",
        salt: "test_salt",
        hash: "test_hash",
      },
    ]);
  });

  it("defaults skip to 0 when invalid skip query is provided", async () => {
    req.query.skip = "2hi0";

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(User.find().skip).toHaveBeenCalledWith(0);
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "test_username",
        email: "test@email.com",
        salt: "test_salt",
        hash: "test_hash",
      },
      {
        _id: "test_id2",
        username: "test_username2",
        email: "test@email.com2",
        salt: "test_salt",
        hash: "test_hash",
      },
    ]);
  });

  it("adjusts limit when valid limit query is provided", async () => {
    req.query.limit = "20";

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(User.find().skip().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "test_username",
        email: "test@email.com",
        salt: "test_salt",
        hash: "test_hash",
      },
      {
        _id: "test_id2",
        username: "test_username2",
        email: "test@email.com2",
        salt: "test_salt",
        hash: "test_hash",
      },
    ]);
  });

  it("defaults limit to 50 when invalid limit query is provided", async () => {
    req.query.limit = "2hi0";

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(User.find().skip().limit).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith([
      {
        _id: "test_id",
        username: "test_username",
        email: "test@email.com",
        salt: "test_salt",
        hash: "test_hash",
      },
      {
        _id: "test_id2",
        username: "test_username2",
        email: "test@email.com2",
        salt: "test_salt",
        hash: "test_hash",
      },
    ]);
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    User.find().skip().limit.mockRejectedValueOnce(mockError);

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });

  it("checks cache using the created cache key for cached data", async () => {
    await searchUsers(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
  });

  it("sets cached data to cache key if no cached data previously found", async () => {
    await searchUsers(req, res);

    expect(cache.setEx).toHaveBeenCalledWith(
      "test_cache_key",
      1800,
      JSON.stringify([
        {
          _id: "test_id",
          username: "test_username",
          email: "test@email.com",
          salt: "test_salt",
          hash: "test_hash",
        },
        {
          _id: "test_id2",
          username: "test_username2",
          email: "test@email.com2",
          salt: "test_salt",
          hash: "test_hash",
        },
      ]),
    );
  });

  it("sends the cached data if cached data is found", async () => {
    cache.get.mockImplementationOnce((key, callback) =>
      callback(
        null,
        JSON.stringify([
          { data: "test_cache_data" },
          {
            _id: "test_id",
            username: "test_username",
            email: "test@email.com",
            salt: "test_salt",
            hash: "test_hash",
          },
          {
            _id: "test_id2",
            username: "test_username2",
            email: "test@email.com2",
            salt: "test_salt",
            hash: "test_hash",
          },
        ]),
      ),
    );

    await searchUsers(req, res);

    expect(cache.get).toHaveBeenCalledWith(
      "test_cache_key",
      expect.any(Function),
    );
    expect(res.json).toHaveBeenCalledWith([
      {
        data: "test_cache_data",
      },
      {
        _id: "test_id",
        username: "test_username",
        email: "test@email.com",
        salt: "test_salt",
        hash: "test_hash",
      },
      {
        _id: "test_id2",
        username: "test_username2",
        email: "test@email.com2",
        salt: "test_salt",
        hash: "test_hash",
      },
    ]);
  });
});
