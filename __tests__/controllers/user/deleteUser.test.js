/* eslint-disable no-undef */
const { deleteUser } = require("../../../controllers/user");
const User = require("../../../models/user");
const mongoose = require("mongoose");

jest.mock("../../../models/user");

describe("USER deleteUser", () => {
  let req, res;

  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

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

  it("deletes specified user", async () => {
    await deleteUser(req, res);

    expect(User.deleteOne).toHaveBeenCalledWith({ _id: "test_id" });
    expect(res.json).toHaveBeenCalledWith({
      message: "Deleted docs: 1",
      deleted: 1,
    });
  });

  it("handles invalid userId by returning 400 and relevant error message", async () => {
    req.params.userId = "invalid_id";
    mongoose.Types.ObjectId.isValid.mockImplementationOnce(() => false);

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid user ID: invalid_id",
    });
  });

  it("handles no user being found gracefully", async () => {
    User.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

    await deleteUser(req, res);

    expect(User.deleteOne).toHaveBeenCalledWith({ _id: "test_id" });
    expect(res.json).toHaveBeenCalledWith({
      message: "Deleted docs: 0",
      deleted: 0,
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    User.deleteOne.mockRejectedValueOnce(mockError);

    await deleteUser(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
