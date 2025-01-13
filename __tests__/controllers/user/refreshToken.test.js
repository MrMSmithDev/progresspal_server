/* eslint-disable no-undef */
const { refreshToken } = require("../../../controllers/user");
const User = require("../../../models/user");
const { authenticateRefreshToken, generateToken } = require("../../../lib/jwt");

jest.mock("../../../lib/jwt");
jest.mock("../../../models/user");

describe("User refreshToken", () => {
  let req, res;

  beforeEach(() => {
    req = {
      cookies: {
        jwt: "mock_refresh_token",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("generates and sends a new jwt token when refresh token is valid", async () => {
    await refreshToken(req, res);

    expect(authenticateRefreshToken).toHaveBeenCalledWith("mock_refresh_token");
    expect(User.findById).toHaveBeenCalledWith("test_id");
    expect(res.json).toHaveBeenCalledWith({
      token: "mock_token",
      username: "test_username",
    });
  });

  it("handles missing jwt cookie and returns 406 with relevant error message", async () => {
    req.cookies = {};

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh unsuccessful: Unauthorized",
    });
  });

  it("handles the refresh token being unauthorized", async () => {
    authenticateRefreshToken.mockReturnValueOnce(false);

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh unsuccessful: Unauthorized",
    });
  });

  it("handles the users id not being located in database", async () => {
    User.findById.mockResolvedValueOnce(null);

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh unsuccessful: unable to validate user",
    });
  });

  it("handles an issue with token not being generated", async () => {
    generateToken.mockReturnValueOnce(undefined);

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh unsuccessful: unable to generate new token",
    });
  });

  it("handles database error by returning 500 and relevant error message", async () => {
    const mockError = new Error("Database error");
    User.findById.mockRejectedValueOnce(mockError);

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
