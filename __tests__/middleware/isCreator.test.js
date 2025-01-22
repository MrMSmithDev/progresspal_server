/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const findCreatorId = require("../../lib/findCreatorId");
const { isCreator } = require("../../middleware");

jest.mock("jsonwebtoken");
jest.mock("mongoose");
jest.mock("../../lib/findCreatorId");

describe("isCreator", () => {
  let req, res, next;

  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      params: {
        userId: "test_user",
        workoutId: "test_workout",
      },
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    mongoose.Types.ObjectId.isValid = jest.fn(() => true);
  });

  it("should return 400 if missing any id type", async () => {
    req.params = {};

    await isCreator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing id for authentication",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if auth header is missing", async () => {
    await isCreator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "You are not authorized to complete this request",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is missing from auth header", async () => {
    req.headers["authorization"] = "Bearer ";

    await isCreator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "You are not authorized to complete this request",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if jwt.verify throws an error", async () => {
    req.headers["authorization"] = "Bearer valid";
    const mockError = new Error("Invalid token");
    jwt.verify.mockImplementationOnce(() => {
      throw mockError;
    });

    await isCreator(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error authenticating creator: Invalid token",
    });
  });

  it("should return 403 if token is valid but does not match creator id", async () => {
    req.headers["authorization"] = "Bearer valid";
    jwt.verify.mockImplementationOnce(() => ({ _id: "invalid_user" }));

    await isCreator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Only the original creator can complete this request",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if token is valid and id matches creator id when passed userId only", async () => {
    req.headers["authorization"] = "Bearer valid";
    req.params = { userId: "test_user" };
    jwt.verify.mockImplementationOnce(() => ({ _id: "test_user" }));

    await isCreator(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should call next() if token is valid and id matches creator id when passed workoutId only", async () => {
    req.headers["authorization"] = "Bearer valid";
    req.params = { workoutId: "test_workout" };
    findCreatorId.mockImplementationOnce(() => "test_workout_user");
    jwt.verify.mockImplementationOnce(() => ({ _id: "test_workout_user" }));

    await isCreator(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
