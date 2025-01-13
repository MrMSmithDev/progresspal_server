/* eslint-disable no-undef */
const { login } = require("../../../controllers/user");
const User = require("../../../models/user");
const { verifyPassword } = require("../../../lib/password");

jest.mock("../../../lib/jwt");
jest.mock("../../../lib/password");
jest.mock("../../../models/user");

describe("USER login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        username: "test_username",
        password: "test_password",
      },
    };

    res = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sets relevant cookies and sends the username and token on successful login", async () => {
    await login(req, res);

    expect(User.find).toHaveBeenCalledWith({ username: "test_username" });
    expect(User.find().limit).toHaveBeenCalledWith(1);
    expect(verifyPassword).toHaveBeenCalledWith(
      "test_password",
      "test_salt",
      "test_hash",
    );
    expect(res.cookie).toHaveBeenCalledWith(
      "jwt",
      "mock_refresh_token",
      expect.any(Object),
    );
    expect(res.json).toHaveBeenCalledWith({
      username: "test_username",
      token: "mock_token",
    });
  });

  it("handles an incorrect username entry with relevant error message", async () => {
    User.find().limit.mockResolvedValueOnce([]);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid username or password",
    });
  });

  it("handles an incorrect password entry with relevant error message", async () => {
    verifyPassword.mockReturnValueOnce(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid username or password",
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    User.find().limit.mockRejectedValueOnce(mockError);

    await login(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });

    consoleSpy.mockRestore();
  });
});
