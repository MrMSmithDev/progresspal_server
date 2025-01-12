/* eslint-disable no-undef */
const { getUserById } = require("../../../controllers/user");
const User = require("../../../models/user");
const mongoose = require("mongoose");

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

    User.findById.mockRejectedValueOnce(mockError);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
