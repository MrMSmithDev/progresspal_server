/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");
const { isAuth } = require("../../middleware");

jest.mock("jsonwebtoken");

const mockJWTSecret = "mock_secret";
process.env.JWT_SECRET = mockJWTSecret;

describe("isAuth", () => {
  let req, res, next;

  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if authorization header missing", () => {
    isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "You are not authorized to access this resource",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is missing in the authorization header", () => {
    req.headers["authorization"] = "Bearer ";
    isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "You are not authorized to access this resource",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if jwt.verify throws an error", () => {
    req.headers["authorization"] = "Bearer invalid_token";
    const mockError = new Error("Invalid token");
    jwt.verify.mockImplementation(() => {
      throw mockError;
    });

    isAuth(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error authenticating token: Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next() if token is valid", () => {
    const mockPayload = { id: "12345", username: "test_user" };
    req.headers["authorization"] = "Bearer valid_token";
    jwt.verify.mockReturnValue(mockPayload);

    isAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid_token",
      process.env.JWT_SECRET,
    );
    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
