/* eslint-disable no-undef */
const { changeRole } = require("../../../controllers/user");
const User = require("../../../models/user");
const mongoose = require("mongoose");

jest.mock("../../../models/user");

describe("USER changeRole", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        userId: "test_id",
      },
      body: {
        admin: true,
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

  it("changes a users admin status to true", async () => {
    await changeRole(req, res);

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: "test_id" },
      { admin: true },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Updated docs: docid-5",
    });
  });

  it("handles being passed an invalid userId", async () => {
    req.params.userId = "invalid_id";
    mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);

    await changeRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid user ID: invalid_id",
    });
  });

  it("handles being passed an undefined admin status", async () => {
    req.body.admin = undefined;

    await changeRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Type change status invalid",
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    User.updateOne.mockRejectedValueOnce(mockError);

    await changeRole(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
