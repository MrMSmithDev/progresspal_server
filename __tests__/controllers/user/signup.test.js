/* eslint-disable no-undef */
const { signup } = require("../../../controllers/user");
const User = require("../../../models/user");
const { verifySignupInput } = require("../../../lib/verification");

jest.mock("../../../models/user");
jest.mock("../../../lib/verification");
jest.mock("../../../lib/password");
jest.mock("../../../lib/jwt");

describe("USER signup", () => {
  let req, res;
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    req = {
      body: {
        username: "test_username",
        email: "test@email.com",
        password: "test_password",
        passwordRepeat: "test_password",
        target: "10",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("creates a new user successfully", async () => {
    await signup(req, res);

    expect(verifySignupInput).toHaveBeenCalledWith(
      "test_username",
      "test@email.com",
      "test_password",
      "test_password",
    );
    expect(User).toHaveBeenCalledWith({
      username: "test_username",
      email: "test@email.com",
      salt: "test_salt",
      hash: "test_hash",
      target: 10,
    });
    expect(res.cookie).toHaveBeenCalledWith(
      "jwt",
      "mock_refresh_token",
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User created",
      id: "test_id",
      token: "mock_token",
      username: "test_username",
    });
  });

  it("returns a validation error on invalid entry", async () => {
    verifySignupInput.mockResolvedValueOnce({
      status: 400,
      error: "Invalid input",
    });

    await signup(req, res);

    expect(verifySignupInput).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
  });

  it("handles and discards an invalid target input", async () => {
    req.body.target = "invalid";

    await signup(req, res);

    expect(User).toHaveBeenCalledWith({
      username: "test_username",
      email: "test@email.com",
      salt: "test_salt",
      hash: "test_hash",
      target: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("handles and discards an invalid target input including numerical digit", async () => {
    req.body.target = "invalid10";

    await signup(req, res);

    expect(User).toHaveBeenCalledWith({
      username: "test_username",
      email: "test@email.com",
      salt: "test_salt",
      hash: "test_hash",
      target: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("handles a target larger than the maximum allowed and reduces to 28", async () => {
    req.body.target = "60";

    await signup(req, res);

    expect(User).toHaveBeenCalledWith({
      username: "test_username",
      email: "test@email.com",
      salt: "test_salt",
      hash: "test_hash",
      target: 28,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");

    User.mockImplementationOnce(() => ({
      save: jest.fn().mockRejectedValueOnce(mockError),
    }));
    await signup(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
