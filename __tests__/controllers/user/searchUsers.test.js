/* eslint-disable no-undef */
const { searchUsers } = require("../../../controllers/user");
const User = require("../../../models/user");

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
    expect(User.find().limit).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith([
      { _id: "test_id", username: "test_username", email: "test@email.com" },
      { _id: "test_id2", username: "test_username2", email: "test@email.com2" },
    ]);
  });

  it("return an empty dataset, when no users match the query", async () => {
    User.find().limit.mockResolvedValueOnce([]);

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("searches for username when username query provided", async () => {
    req.query.username = "queried_username";
    User.find().limit.mockResolvedValueOnce([
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
    User.find().limit.mockResolvedValueOnce([
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
    User.find().limit.mockResolvedValueOnce([
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

  it("adjusts limit when valid limit query is provided", async () => {
    req.query.limit = "20";

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(User.find().limit).toHaveBeenCalledWith(20);
    expect(res.json).toHaveBeenCalledWith([
      { _id: "test_id", username: "test_username", email: "test@email.com" },
      { _id: "test_id2", username: "test_username2", email: "test@email.com2" },
    ]);
  });

  it("defaults limit to 50 when invalid limit query is provided", async () => {
    req.query.limit = "2hi0";

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(User.find().limit).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith([
      { _id: "test_id", username: "test_username", email: "test@email.com" },
      { _id: "test_id2", username: "test_username2", email: "test@email.com2" },
    ]);
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    User.find().limit.mockRejectedValueOnce(mockError);

    await searchUsers(req, res);

    expect(User.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
