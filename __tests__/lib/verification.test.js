/* eslint-disable no-undef */
const User = require("../../models/user");
const {
  verifySignupInput,
  verifyWorkoutInput,
} = require("../../lib/verification");

jest.mock("../../models/user");

describe("Verification utilities", () => {
  describe("verifySignupInput", () => {
    it("should return 400 if any field is not a string", async () => {
      const result = await verifySignupInput(
        123,
        "email",
        "password",
        "password",
      );
      expect(result).toEqual({
        status: 400,
        error: "All fields are required as not empty",
      });
    });

    it("should return 400 if passwords do not match", async () => {
      const result = await verifySignupInput(
        "username",
        "email",
        "password",
        "different_password",
      );
      expect(result).toEqual({ status: 400, error: "Passwords do not match" });
    });

    it("should return 400 if username length is invalid", async () => {
      const result = await verifySignupInput(
        "ab",
        "email",
        "password",
        "password",
      );
      expect(result).toEqual({
        status: 400,
        error:
          "Username must be at least 3 characters and at most 30 characters long",
      });
    });

    it("should return 400 if email length is invalid", async () => {
      const result = await verifySignupInput(
        "username",
        "e",
        "password",
        "password",
      );
      expect(result).toEqual({
        status: 400,
        error: "Email must be at least 5 characters long",
      });
    });

    it("should return 400 if password length is invalid", async () => {
      const result = await verifySignupInput(
        "username",
        "email@email.com",
        "short",
        "short",
      );
      expect(result).toEqual({
        status: 400,
        error: "Password must be at least 5 characters long",
      });
    });

    it("should return 400 if username format is invalid", async () => {
      const result = await verifySignupInput(
        "inv@lid",
        "email@email.com",
        "password",
        "password",
      );
      expect(result).toEqual({
        status: 400,
        error: "Username can only contain letters, numbers and underscores",
      });
    });

    it("should return 400 if email format is invalid", async () => {
      const result = await verifySignupInput(
        "username",
        "invalid_email",
        "password",
        "password",
      );
      expect(result).toEqual({
        status: 400,
        error: "Email must be of expected format, e.g. example@email.com",
      });
    });

    it("should return 400 if username already exists", async () => {
      User.find.mockResolvedValueOnce([{ username: "username" }]); // Simulate existing user
      const result = await verifySignupInput(
        "username",
        "email@email.com",
        "password",
        "password",
      );
      expect(User.find).toHaveBeenCalledWith({
        username: { $regex: /username/i },
      });
      expect(result).toEqual({ status: 400, error: "Username already exists" });
    });

    it("should return 200 if all inputs are valid", async () => {
      User.find.mockResolvedValue([]); // Simulate no existing user
      const result = await verifySignupInput(
        "username",
        "email@email.com",
        "password",
        "password",
      );
      expect(result).toEqual({ status: 200, error: null });
    });
  });

  describe("verifyWorkoutInput", () => {
    it("should return 400 if date is in the future", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      const result = verifyWorkoutInput(futureDate, 60, []);
      expect(result).toEqual({
        status: 400,
        error: "Invalid date. Cannot use future times and dates",
      });
    });

    it("should return 400 if length is out of range", () => {
      const result = verifyWorkoutInput(new Date().toISOString(), -5, []);
      expect(result).toEqual({
        status: 400,
        error: "Invalid length. Must be between 1 and 1500 minutes",
      });
    });

    it("should return 400 if exercises is not an array", () => {
      const result = verifyWorkoutInput(
        new Date().toISOString(),
        60,
        "not_an_array",
      );
      expect(result).toEqual({
        status: 400,
        error: "Invalid exercises. Error parsing created exercises",
      });
    });

    it("should return 400 if no exercises are provided", () => {
      const result = verifyWorkoutInput(new Date().toISOString(), 60, []);
      expect(result).toEqual({
        status: 400,
        error:
          "Invalid exercises. Must include at least one exercise undertaken",
      });
    });

    it("should validate exercises correctly", () => {
      const exercises = [
        { type: "strength", name: "Squats", sets: [{ weight: 100, reps: 10 }] },
      ];
      const result = verifyWorkoutInput(
        new Date().toISOString(),
        60,
        exercises,
      );
      expect(result).toEqual({ status: 200, error: null });
    });

    it("should return 400 for invalid exercise types", () => {
      const exercises = [{ type: "invalid_type", name: "Exercise" }];
      const result = verifyWorkoutInput(
        new Date().toISOString(),
        60,
        exercises,
      );
      expect(result).toEqual({
        status: 400,
        error: "Invalid exercise type. Must be 'strength' or 'cardio'.",
      });
    });
  });
});
