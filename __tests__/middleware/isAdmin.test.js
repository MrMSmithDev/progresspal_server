/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");
const { isAdmin } = require("../../middleware");

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

  it("should return 403 if authorization header is missing", () => {
    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "You are not authorized to access this resource",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is missing in the authorization header", () => {
    req.headers["authorization"] = "Bearer ";
    isAdmin(req, res, next);

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

    isAdmin(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error authenticating admin: Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token is valid but admin is false", () => {
    req.headers["authorization"] = "Bearer valid_token";
    jwt.verify.mockReturnValue({ admin: false });

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "You are not authorized to view this admin resource",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if token is valid and admin is true", () => {
    req.headers["authorization"] = "Bearer valid_token";
    jwt.verify.mockReturnValue({ admin: true });

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
