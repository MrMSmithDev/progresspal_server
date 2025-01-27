/* eslint-disable no-undef */
const { updatePassword } = require("../../../controllers/user");
const User = require("../../../models/user");
const { verifyUpdatePasswordInput } = require("../../../lib/verification");
const { verifyPassword, generateSaltHash } = require("../../../lib/password");

jest.mock("../../../models/user");
jest.mock("../../../lib/password");
jest.mock("../../../lib/verification");

describe("USER updatePassword", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        oldPassword: "oldPass123",
        newPassword: "newPass123",
        repeatNewPassword: "newPass123",
      },
      user: {
        _id: "test_id",
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

  it("returns 400 if new passwords are invalid", async () => {
    verifyUpdatePasswordInput.mockReturnValueOnce({
      error: "Passwords do not match",
      status: 400,
    });

    await updatePassword(req, res);

    expect(verifyUpdatePasswordInput).toHaveBeenCalledWith(
      "newPass123",
      "newPass123",
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Passwords do not match",
    });
  });

  it("returns 404 if user is not found", async () => {
    User.findById.mockResolvedValueOnce(null);

    await updatePassword(req, res);

    expect(User.findById).toHaveBeenCalledWith("test_id");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("returns 404 if old password is incorrect", async () => {
    const mockUser = { salt: "test_salt", hash: "test_hash" };
    User.findById.mockResolvedValueOnce(mockUser);
    verifyPassword.mockReturnValueOnce(false);

    await updatePassword(req, res);

    expect(User.findById).toHaveBeenCalledWith("test_id");
    expect(verifyPassword).toHaveBeenCalledWith(
      "oldPass123",
      "test_salt",
      "test_hash",
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Bad authorization" });
  });

  it("updates the user's password and returns success", async () => {
    const testUser = { salt: "test_salt", hash: "test_hash", save: jest.fn() };
    User.findById.mockResolvedValueOnce(testUser);

    const mockNewHash = { salt: "new_salt", hash: "new_hash" };
    generateSaltHash.mockReturnValueOnce(mockNewHash);

    await updatePassword(req, res);

    expect(User.findById).toHaveBeenCalledWith("test_id");
    expect(verifyPassword).toHaveBeenCalledWith(
      "oldPass123",
      "test_salt",
      "test_hash",
    );
    expect(generateSaltHash).toHaveBeenCalledWith("newPass123");
    expect(testUser.salt).toBe("new_salt");
    expect(testUser.hash).toBe("new_hash");
    expect(testUser.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password updated successfully",
    });
  });

  it("returns 500 if an unexpected error occurs", async () => {
    const mockError = new Error("Database error");
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    User.findById.mockRejectedValue(mockError);

    await updatePassword(req, res);

    expect(User.findById).toHaveBeenCalledWith("test_id");
    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: `Internal server error: ${mockError.message}`,
    });
  });
});
