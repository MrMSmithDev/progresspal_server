/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");

const mockJwtSecret = "test_jwt_secret";
const mockJwtRefreshSecret = "test_jwt_refresh_secret";

process.env.JWT_SECRET = mockJwtSecret;
process.env.JWT_REFRESH_SECRET = mockJwtRefreshSecret;

const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken,
  authenticateRefreshToken,
  returnUser,
} = require("../../lib/jwt");

jest.mock("jsonwebtoken");

describe("JWT utility functions", () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("should generate a JWT token with correct payload", () => {
      const user = {
        id: "12345",
        username: "test_username",
        admin: false,
      };

      const mockToken = "mock_token";
      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "12345", username: "test_username", admin: false },
        "test_jwt_secret",
        { expiresIn: "1h" },
      );
      expect(token).toBe(mockToken);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a refresh token with correct payload", () => {
      const userId = "12345";

      const mockRefreshToken = "mock_refresh_token";
      jwt.sign.mockReturnValue(mockRefreshToken);

      const token = generateRefreshToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        mockJwtRefreshSecret,
        { expiresIn: "365d" },
      );
      expect(token).toBe(mockRefreshToken);
    });
  });

  describe("verifyToken", () => {
    it("should verify the token and return payload", () => {
      const mockToken = "mock_token";
      const mockPayload = { id: "12345", username: "test_user", admin: false };

      jwt.verify.mockReturnValue(mockPayload);

      const payload = verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockJwtSecret);
      expect(payload).toEqual(mockPayload);
    });

    it("should throw an error if token verification fails", () => {
      const mockToken = "mock_token";

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyToken(mockToken)).toThrow("Invalid token");
    });
  });

  describe("returnUser", () => {
    it("should return the user from the token", () => {
      const mockToken = "mock_token";
      const mockPayload = { id: "12345", username: "test_user", admin: false };

      jwt.verify.mockReturnValue(mockPayload);

      const user = returnUser(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockJwtSecret);
      expect(user).toEqual(mockPayload);
    });
  });

  describe("authenticateToken", () => {
    it("should call next() if token is valid", () => {
      const req = { headers: { authorization: "Bearer mock_token" } };
      const res = {};
      const next = jest.fn();
      const mockPayload = { id: "12345", username: "test_user", admin: false };

      jwt.verify.mockReturnValue(mockPayload);

      authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith("mock_token", mockJwtSecret);
      expect(res.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    it("should set req.user to null and call next() if no token is provided", () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it("should return an error if token verification fails", () => {
      const req = { headers: { authorization: "Bearer invalid_token" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error authenticating JWT token: Error: Invalid token",
      });
    });
  });

  describe("authenticateRefreshToken", () => {
    it("should return decoded token if refresh token is valid", () => {
      const mockRefreshToken = "mock_refresh_token";
      const mockDecoded = { id: "12345" };

      jwt.verify.mockReturnValue(mockDecoded);

      const decoded = authenticateRefreshToken(mockRefreshToken);

      expect(decoded).toEqual(mockDecoded);
    });

    it("should return false if refresh token verification fails", () => {
      const mockRefreshToken = "mock_refresh_token";
      const mockError = new Error("InvalidRefreshToken");

      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      const result = authenticateRefreshToken(mockRefreshToken);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });
  });
});
