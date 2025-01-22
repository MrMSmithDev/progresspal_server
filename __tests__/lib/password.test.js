/* eslint-disable no-undef */
const crypto = require("crypto");
const { generateSaltHash, verifyPassword } = require("../../lib/password");

describe("Password utilities", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateSaltHash", () => {
    it("should generate a salt and hash for a given string", () => {
      const mockString = "password";

      crypto.randomBytes.mockImplementationOnce(() => ({
        toString: jest.fn().mockReturnValue("mock_salt"),
      }));
      crypto.pbkdf2Sync.mockImplementationOnce(() => ({
        toString: jest.fn().mockReturnValueOnce("mock_hash"),
      }));

      const { salt, hash } = generateSaltHash(mockString);

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
        mockString,
        "mock_salt",
        10000,
        64,
        "sha512",
      );

      expect(salt).toBe("mock_salt");
      expect(hash).toBe("mock_hash");
    });
  });

  describe("verifyPassword", () => {
    it("should return true for a valid password, salt, and hash", () => {
      const password = "password";
      const salt = "mock_salt";
      const hash = "mock_hash";

      // Mock crypto.pbkdf2Sync to match the hash
      crypto.pbkdf2Sync.mockImplementationOnce(() => ({
        toString: jest.fn().mockReturnValueOnce("mock_hash"),
      }));

      const result = verifyPassword(password, salt, hash);

      expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
        password,
        salt,
        10000,
        64,
        "sha512",
      );

      expect(result).toBe(true);
    });

    it("should return false for an invalid password", () => {
      const password = "wrong_password";
      const salt = "mock_salt";
      const hash = "mock_hash";

      crypto.pbkdf2Sync.mockImplementationOnce(() => ({
        toString: jest.fn().mockReturnValueOnce("invalid_hash"),
      }));

      const result = verifyPassword(password, salt, hash);

      expect(result).toBe(false);
    });

    it("should return false for invalid input types", () => {
      expect(verifyPassword(12345, "salt", "hash")).toBe(false);
      expect(verifyPassword("password", null, "hash")).toBe(false);
      expect(verifyPassword("password", "salt", {})).toBe(false);
    });
  });
});

jest.mock("crypto");
